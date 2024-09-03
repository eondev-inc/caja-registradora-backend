import { AppConfig } from '@/config/app/enums/app-config.enum';
import { Users } from '@/generated/prisma/users/entities/users.entity';
import { UpdateUsersTokensDto } from '@/generated/prisma/usersTokens/dto/update-usersTokens.dto';
import { UsersTokens } from '@/generated/prisma/usersTokens/entities/usersTokens.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@/config/app/app-config.service';
import { CreateUsersTokensDto } from '@/generated/prisma/usersTokens/dto/create-usersTokens.dto';
import { PayloadToken } from './interface/token.interface';
import { Roles } from '@/generated/prisma/roles/entities/roles.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
  ) {}
  /**
   * Método que genera el token de sesión de usuario
   * @param user
   * @returns usuario y token
   */
  async generateJWT(user: Users) {
    const isValidToken = await this.tokenStillValid(user);
    if (!isValidToken) {
      return this.manageTokenAccounts(user);
    }
    return {
      access_token: isValidToken.token,
      user,
    };
  }
  /**
   * Método que crea el token de usuario
   * @param data
   * @returns
   */
  async saveTokenAccounts(
    data: UpdateUsersTokensDto | CreateUsersTokensDto,
    id: bigint,
  ) {
    const tokenData = this.prismaService.users_tokens.create({
      data: { token: data.token, users: { connect: { id } } },
    });
    return tokenData;
  }

  /**
   * Método que actualiza el token de usuario
   * @param data
   * @param changes
   * @returns
   */
  async updateTokenAccounts(
    { id }: Users,
    changes: UpdateUsersTokensDto | CreateUsersTokensDto,
  ) {
    const tokenOld: UsersTokens =
      await this.prismaService.users_tokens.findFirst({
        where: { users: { id } },
      });
    if (!tokenOld) {
      return this.saveTokenAccounts(changes, id);
    }
    return this.prismaService.users_tokens.update({
      where: { id: tokenOld.id, user_id: id },
      include: { users: true },
      data: changes,
    });
  }

  /**
   * Método que calcula la fecha y hora de expiración del token JWT
   * @returns
   */
  calculateNextExpiration() {
    const currentTime = Date.now();
    const expirationHour = this.appConfigService.get(
      AppConfig.API_JWT_EXPIRING_HOUR,
    );
    const expirationTime = currentTime + expirationHour * 60 * 60 * 1000;
    return Math.floor(expirationTime / 1000);
  }

  /**
   * Método que revisa si es necesario crear o actualizar el token
   * @param data
   * @param user
   * @returns
   */
  async manageTokenAccounts(userToken: Users) {
    const exp = this.calculateNextExpiration();

    const payload: PayloadToken = { sub: userToken.id, exp };

    const tokenData = <CreateUsersTokensDto>{
      token: this.jwtService.sign(payload),
      is_revoked: false,
    };
    const { token, user_id } = await this.updateTokenAccounts(
      userToken,
      tokenData as UpdateUsersTokensDto,
    );
    return {
      access_token: token,
      user: await this.prismaService.users.findUnique({
        include: { roles: { select: { role_name: true } } },
        where: { id: user_id },
      }),
    };
  }

  /**
   * Método que encuentra el token de un usuario
   * @param id
   * @returns
   */
  async findTokenByUserId(id: bigint) {
    try {
      return await this.prismaService.users_tokens.findFirst({
        where: { users: { id: id } },
      });
    } catch (error) {
      throw new NotFoundException(error);
    }
  }

  async tokenStillValid({ id }: Users): Promise<UsersTokens> {
    try {
      const tokenValid: UsersTokens =
        await this.prismaService.users_tokens.findFirst({
          where: { users: { id } },
        });

      const isValid = await this.jwtService.verify(tokenValid.token);

      return !tokenValid.is_revoked && isValid ? tokenValid : undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Método que crea el token de usuario
   * @param data
   * @param user
   * @returns
   */
  async saveToken(data: CreateUsersTokensDto, user: Users) {
    return await this.prismaService.users_tokens.create({
      data: { ...data, users: { connect: { id: user.id } } },
    });
    // user.id = data;
    // tokenData.user = user;
    // return this.tokenRepo.save(tokenData);
  }

  /**
   * Método que actualiza el token de usuario
   * @param data
   * @param changes
   * @returns
   */
  async updateToken(data: UsersTokens, changes: UpdateUsersTokensDto) {
    return await this.prismaService.users_tokens.update({
      where: { token: data.token, id: data.id },
      data: changes,
    });
  }

  /**
   * Método que revisa si es necesario crear o actualizar el token
   * @param data
   * @param user
   * @returns
   */
  async manageToken(data: UsersTokens | UpdateUsersTokensDto, user: Users) {
    const isMatch = await this.findTokenByUserId(user.id);
    if (!isMatch) {
      return await this.saveToken(data as CreateUsersTokensDto, user);
    }
    return await this.updateToken(isMatch, data as UpdateUsersTokensDto);
  }

  /**
   * Método que elimina e invalida el token del usuario
   * @param id
   * @returns
   */
  async deleteToken(id: bigint) {
    try {
      return this.prismaService.users_tokens.delete({
        where: { id },
      });
    } catch (error) {
      //logger
    }
  }

  /**
   * Método que verifica el token de la base de datos del usuario
   **/
  async verifyTokenRevoke(id: bigint): Promise<UsersTokens> {
    const token: UsersTokens = await this.prismaService.users_tokens.findFirst({
      where: { user_id: id },
      include: { users: true },
    });
    return token;
  }
}
