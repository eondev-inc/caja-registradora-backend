import {
  BadRequestException,
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
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/modules/redis/redis.service';
import { AppConfig } from '@/config/app/enums/app-config.enum';

const LOGIN_LOCK_PREFIX = 'caja:login:fail:';
const REFRESH_TOKEN_PREFIX = 'caja:refresh:';

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
   * @param redisService - Servicio Redis para cache y login-lock.
   * @param configService - Servicio de configuración.
   */
  constructor(
    private readonly jwtServivice: JwtService,
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Autentica un usuario con su email y contraseña.
   * Implementa login-lock: bloquea la cuenta tras N intentos fallidos.
   * @param email - Email del usuario.
   * @param password - Contraseña del usuario.
   * @returns Un objeto con accessToken, refreshToken y datos del usuario.
   * @throws UnauthorizedException - Si las credenciales son incorrectas o la cuenta está bloqueada.
   */
  async authenticateUser({ email, password }: AuthenticationDto) {
    const lockKey = `${LOGIN_LOCK_PREFIX}${email}`;
    const maxRetries = this.configService.get<number>(AppConfig.LOGIN_MAX_RETRIES) ?? 5;
    const lockSeconds = this.configService.get<number>(AppConfig.LOGIN_LOCK_SECONDS) ?? 300;

    // Verificar si la cuenta está bloqueada
    const retries = await this.redisService.get(lockKey);
    if (retries && parseInt(retries, 10) >= maxRetries) {
      const remaining = await this.redisService.ttl(lockKey);
      throw new UnauthorizedException(
        `Cuenta bloqueada por demasiados intentos fallidos. Intentá nuevamente en ${remaining} segundos.`,
      );
    }

    const user = await this.prismaService.users.findFirst({
      select: {
        id: true,
        email: true,
        forenames: true,
        surnames: true,
        password: true,
        nid: true,
        user_roles: {
          select: {
            roles: {
              select: {
                role_name: true,
              },
            },
          },
        },
        entity_users: {
          select: {
            entities: {
              select: {
                id: true,
                entity_name: true,
              },
            },
          },
        },
      },
      where: { email },
    });

    // Credenciales incorrectas: incrementar contador de fallos
    if (!user) {
      await this.redisService.incrementWithTtl(lockKey, lockSeconds);
      throw new NotFoundException('Credenciales incorrectas');
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      const count = await this.redisService.incrementWithTtl(lockKey, lockSeconds);
      this.logger.error(`Login fallido para ${email}. Intento ${count}/${maxRetries}.`);
      throw new NotFoundException('Credenciales incorrectas');
    }

    // Login exitoso: limpiar contador de fallos
    await this.redisService.del(lockKey);

    const accessExpiry = this.configService.get<string>(AppConfig.JWT_ACCESS_EXPIRY) ?? '15m';
    const refreshExpiry = this.configService.get<string>(AppConfig.JWT_REFRESH_EXPIRY) ?? '7d';

    const roleNames = user.user_roles.map((ur) => ur.roles.role_name);

    const accessToken = this.jwtServivice.sign(
      { sub: user.id, roles: roleNames },
      { expiresIn: accessExpiry },
    );

    const refreshToken = this.jwtServivice.sign(
      { sub: user.id, roles: roleNames },
      { expiresIn: refreshExpiry },
    );

    await this.saveAccessToken(user.id, accessToken);
    await this.saveRefreshTokenInRedis(user.id, refreshToken);

    delete user.password;

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Guarda el token de acceso en la base de datos (hash).
   * @param userId - ID del usuario.
   * @param accessToken - Token de acceso.
   */
  async saveAccessToken(userId: string, accessToken: string) {
    const userToken = await this.prismaService.users_tokens.findFirst({
      where: { user_id: userId },
    });

    const token = await hash(accessToken, await genSalt(10));

    if (userToken) {
      await this.prismaService.users_tokens.update({
        where: { id: userToken.id },
        data: { token, is_revoked: false },
      });
    } else {
      await this.prismaService.users_tokens.create({
        data: { user_id: userId, token, is_revoked: false },
      });
    }
  }

  /**
   * Guarda el refresh token en Redis (7 días de TTL).
   * Permite validar y revocar sesiones sin tocar la DB en cada request.
   * @param userId - ID del usuario.
   * @param refreshToken - Token de refresco firmado.
   */
  async saveRefreshTokenInRedis(userId: string, refreshToken: string): Promise<void> {
    const ttlDays = this.configService.get<number>(AppConfig.JWT_REFRESH_TTL_DAYS) ?? 7;
    const ttl = ttlDays * 24 * 60 * 60; // días → segundos
    await this.redisService.set(`${REFRESH_TOKEN_PREFIX}${userId}`, refreshToken, ttl);
  }

  /**
   * Valida un token de refresco.
   * Verifica firma JWT y existencia en Redis (revocación).
   * @param refreshToken - Token de refresco a validar.
   * @returns Un objeto con el nuevo accessToken.
   * @throws UnauthorizedException - Si el token es inválido o fue revocado.
   */
  async validateRefreshToken(refreshToken: string) {
    try {
      const isValid = await this.jwtServivice.verify(refreshToken);

      if (!isValid) {
        throw new UnauthorizedException('Token de refresco inválido');
      }

      const { sub: userId } = await this.jwtServivice.decode(refreshToken);

      // Verificar que el refresh token en Redis coincide (no fue revocado)
      const storedToken = await this.redisService.get(`${REFRESH_TOKEN_PREFIX}${userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Sesión expirada o revocada');
      }

      const accessToken = this.jwtServivice.sign(
        { sub: userId },
        { expiresIn: '1h' },
      );

      await this.saveAccessToken(userId, accessToken);

      return { accessToken };
    } catch (error) {
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
    const { email, password, nid, forenames, surnames, entity_id } =
      createUserDto;

    const existingUserEmail = await this.prismaService.users.findFirst({
      where: { email },
    });

    const existingUserNid = await this.prismaService.users.findFirst({
      where: { nid },
    });

    if (existingUserEmail || existingUserNid) {
      throw new ConflictException('El usuario ya está registrado');
    }

    const hashedPassword = await hash(password, await genSalt(10));
    const formattedNid = RUT.validate(nid) ? RUT.format(nid) : null;

    if (!formattedNid) {
      throw new BadRequestException('RUT inválido');
    }

    const { id } = await this.prismaService.roles.findFirst({
      where: { role_name: RolesAutentia.CAJERO },
    });

    const user = await this.prismaService.users.create({
      data: {
        email,
        password: hashedPassword,
        nid: formattedNid,
        forenames,
        surnames,
        user_roles: {
          create: {
            roles: { connect: { id } },
          },
        },
        entity_users: {
          create: {
            entities: { connect: { id: entity_id } },
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
    delete user.password;

    return user;
  }

  /**
   * Cierra la sesión de un usuario.
   * Revoca el refresh token en Redis y marca el token en DB como revocado.
   * @param refreshToken - Token de refresco activo del usuario.
   */
  async logoutUser(refreshToken: string) {
    const decode = await this.jwtServivice.decode(refreshToken);
    const userId = decode.sub;

    // Revocar en Redis
    await this.redisService.del(`${REFRESH_TOKEN_PREFIX}${userId}`);

    // Revocar en DB
    await this.prismaService.users_tokens.updateMany({
      where: { user_id: userId },
      data: { is_revoked: true },
    });
  }
}
