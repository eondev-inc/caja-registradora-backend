import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
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
  async authenticateUser({ email, password }: AuthenticationDto) {
    // Autenticar usuario con email y password
    const user = await this.prismaService.users.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtServivice.sign(payload),
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
}