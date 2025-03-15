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
  async authenticateUser({email, password}: AuthenticationDto) {
    const user = await this.prismaService.users.findFirst({
      select:{
        id: true,
        email: true,
        forenames: true,
        surnames: true,
        password: true,
        nid: true,
        roles: {
          select: {
            role_name: true,
          },
        },
      },
      where: {
        email,
      },
    });
    // Si el usuario no existe, lanzar UnauthorizedException
    if (!user) {
      throw new NotFoundException('Credenciales incorrectas');
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.error('Credenciales incorrectas', password);
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

    this.saveAccessToken(user.id, accessToken);

    delete user.password;

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Guarda el token de refresco en la base de datos.
   * @param userId - ID del usuario.
   * @param accessToken - Token de refresco.
   */
  async saveAccessToken(userId: string, accessToken: string) {
    console.log(userId)
    console.log(accessToken)
  
    const userToken = await this.prismaService.users_tokens.findFirst({
      where: {
        user_id: userId,
      },
    });
    
    const token = await hash(accessToken, await genSalt(10));

    if (userToken) {
      await this.prismaService.users_tokens.update({
        where: {
          id: userToken.id,
        },
        data: {
          token,
          is_revoked: false,
        },
      });
    } else {
      await this.prismaService.users_tokens.create({
        data: {
          user_id: userId,
          token,
          is_revoked: false,
        },
      });
    }
  }

  /**
   * Valida un token de refresco.
   * @param refreshToken - Token de refresco a validar.
   * 
   * @returns Un objeto con la información del usuario autenticado.
   * @throws UnauthorizedException - Si el token de refresco es inválido.
  **/
  async validateRefreshToken(refreshToken: string) {
    try {
      console.log(refreshToken);
      const isValid = await this.jwtServivice.verify(refreshToken);
    
      if (!isValid) {
        throw new UnauthorizedException('Token de refresco inválido');
      }
      const { sub: userId } = await this.jwtServivice.decode(refreshToken);

      const accessToken = this.jwtServivice.sign(
        { sub: userId },
        { expiresIn: '1h' },
      );

      this.saveAccessToken(userId, accessToken);

      return {
        accessToken,
      };
    }catch (error) {
      this.logger.error('Token de refresco inválido', error);
      throw new UnauthorizedException('Token de refresco inválido');
    }
    
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * @param createUserDto - DTO con la información del usuario a crear.
   * @returns El usuario creado.
   * @throws ConflictException - Si el email ya está registrado.
   */
  async registerUser(createUserDto: CreateUserDto) {
    const { email, password, nid, nidType, forenames, surnames } =
      createUserDto;

    const existingUserEmail = await this.prismaService.users.findFirst({
      where: { email },
    });

    const existingUserNid = await this.prismaService.users.findFirst({
      where: { nid },
    });
    // Si el email o el RUT ya están registrados, lanzar ConflictException
    if (existingUserEmail || existingUserNid) {
      throw new ConflictException('El usuario ya está registrado');
    }

    const hashedPassword = await hash(password, await genSalt(10));
    const formattedNid = RUT.validate(nid) ? RUT.format(nid) : null;

    const { id } = await this.prismaService.roles.findFirst({
      where: {
        role_name: RolesAutentia.ASISTENTE,
      },
    });
    // Crear el usuario con la información proporcionada
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

    if (!user) {
      this.logger.error('Error al crear el usuario', user);
      throw new HttpException(
        'Error al crear el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
