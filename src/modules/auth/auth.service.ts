import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { AuthenticationDto } from './dtos/authentication.dto';
import { RolesAutentia } from './enum/autentia-rol.enum';
import RUT from 'rut-chile';
import { compare, genSalt, hash } from 'bcrypt';
import { CreateUserDto } from './dtos/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { LoggingConfigService } from '@/config/logging/logging-config.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Servicio de autenticación para manejar la lógica de autenticación y registro de usuarios.
 */
@Injectable()
export class AuthService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  /**
   * Constructor del servicio de autenticación.
   * @param jwtServivice - Servicio JWT para manejar tokens.
   * @param prismaService - Servicio Prisma para interactuar con la base de datos.
   */
  constructor(
    private readonly jwtServivice: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Autentica un usuario con su email y contraseña.
   * @param email - Email del usuario.
   * @param password - Contraseña del usuario.
   * @returns Un objeto con la información del usuario autenticado.
   * @throws UnauthorizedException - Si las credenciales son incorrectas.
   */
  async authenticateUser(jsonToken: AuthenticationDto) {
    const user = await this.prismaService.users.findFirst({
      where: {
        email: jsonToken.email ,
      },
    });

    if (!user) {
      throw new NotFoundException('Credenciales incorrectas');
    }
    const isPasswordValid = compare(jsonToken.password, user.password);

    if (!isPasswordValid) {
      throw new NotFoundException('Credenciales incorrectas');
    }

    const accessToken = this.jwtServivice.sign(
      { sub: user.id },
      { expiresIn: 60000 },
    );

    const refreshToken = this.jwtServivice.sign(
      { sub: user.id },
      { expiresIn: '7d' },
    );

    this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Guarda el token de refresco en la base de datos.
   * @param userId - ID del usuario.
   * @param refreshToken - Token de refresco.
   */
  async saveRefreshToken(userId: string, refreshToken: string) {

    // Verificar si el usuario existe
    const user = await this.prismaService.users.findUnique({
      where: { id: userId },
    });

    const userToken = await this.prismaService.users_tokens.findFirst({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    
    const token = await hash(refreshToken, await genSalt(10));

    await this.prismaService.users_tokens.upsert({
      where: {
        id: userToken?.id,
      },
      create: {
        user_id: user.id,
        token,
        is_revoked: false,
      },
      update: {
        token,
        is_revoked: false,
      },
    });
  }

  /**
   * Valida un token de refresco.
   * @param refreshToken - Token de refresco a validar.
   * 
   * @returns Un objeto con la información del usuario autenticado.
   * @throws UnauthorizedException - Si el token de refresco es inválido.
  **/
  async validateRefreshToken(token: string) {

    const isValid = await this.jwtServivice.verify(token);
    
    if (!isValid) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    const userToken = await this.prismaService.users_tokens.findFirst({
      where: {
        token: await hash(token, await genSalt(10)),
        is_revoked: false,
      },
    });

    if (!token) {
      throw new UnauthorizedException('Token de refresco inválido');
    }

    const accessToken = this.jwtServivice.sign(
      { sub: userToken.user_id },
      { expiresIn: '1h' },
    );

    return {
      accessToken,
    };
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param createUserDto - DTO con la información del usuario a crear.
   * @returns El usuario creado.
   * @throws ConflictException - Si el email ya está registrado.
   */
  async registerUser(createUserDto: CreateUserDto) {
    const { email, password, nid, nidType, forenames, surnames } = createUserDto;

    const existingUser = await this.prismaService.users.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await hash(password, await genSalt(10));
    const formattedNid = RUT.validate(nid) ? RUT.format(nid) : null;

    const { id } = await this.prismaService.roles.findFirst({
      where: {
        role_name: RolesAutentia.ASISTENTE,
      },
    });

    const user = await this.prismaService.users.create({
      data: {
        email,
        password: hashedPassword,
        nid: formattedNid,
        nid_type: nidType.toUpperCase(),
        forenames,
        surnames,
        user_id: uuidv4(),
        roles: {
          connect: {
            id,
          },
        },
      },
    });

    if(!user) {
      this.logger.error('Error al crear el usuario', user);
      throw new HttpException('Error al crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return user;
  }

  /**
   * Cierra la sesión de un usuario.
   * @param userId - ID del usuario.
   */
  async logoutUser(refreshToken: string) {
    const decode = await this.jwtServivice.decode(refreshToken);
    const userId = decode.sub;
    
    await this.prismaService.users_tokens.updateMany({
      where: {
        user_id: userId,
      },
      data: {
        is_revoked: true,
      },
    });
  }
}