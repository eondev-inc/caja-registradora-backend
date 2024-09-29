import {
  ConflictException,
  HttpException,
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
//import uuid
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = LoggingConfigService.getInstance().getLogger();

  constructor(
    private readonly jwtServivice: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async authenticateUser({ email, password }: AuthenticationDto) {
    //Autenticar usuario con email y password
    const user = await this.prismaService.users.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contrasea incorrecta');
    }

    const accessToken = this.jwtServivice.sign({
      sub: user.id,
      email: user.email,
    });
    //Create the register in user_tokens table for the user
    await this.prismaService.users_tokens.create({
      data: {
        user_id: user.id,
        token: accessToken,
      },
    });

    return {
      access_token: accessToken,
    };
  }

  async registerUser(createuser: CreateUserDto) {
    try {
      this.logger.log({ createuser });
      //formatear el rut chileno del usuario
      const rut = RUT.validate(createuser.nid)
        ? RUT.deformat(createuser.nid)
        : null;
      if (!rut) {
        throw new ConflictException('Rut inválido');
      }
      this.logger.log({ rut });
      const existingUser = await this.prismaService.users.findFirst({
        where: {
          nid: rut,
        },
      });
      this.logger.log({ existingUser });
      if (existingUser) {
        throw new ConflictException('Usuario ya existe');
      }
      // voy a crear un usuario en la base de datos de la aplicación una
      const salt = await genSalt(10);
      this.logger.log({ salt });
      const hashedPassword = await hash(createuser.password, salt);
      this.logger.log({ hashedPassword });
      const uuid = uuidv4();

      const { id } = await this.prismaService.roles.findFirst({
        where: {
          role_name: RolesAutentia.ASISTENTE,
        },
      });
      this.logger.log({ id });

      return this.prismaService.users.create({
        data: {
          nid: rut,
          nid_type: createuser.nidType.toUpperCase(),
          password: hashedPassword,
          email: createuser.email,
          forenames: createuser.forenames,
          surnames: createuser.surnames,
          user_id: uuid,
          roles: {
            connect: {
              id,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error('error', error);
      return new HttpException(error, 500);
    }
  }
}
