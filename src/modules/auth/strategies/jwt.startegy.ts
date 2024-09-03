import { PassportStrategy } from '@nestjs/passport';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AppConfigService } from '../../../config/app/app-config.service';
import { TokenService } from '../token.service';
import { AppConfig } from '../../../config/app/enums/app-config.enum';
import { UsersTokens } from '@/generated/prisma/usersTokens/entities/usersTokens.entity';
import { PayloadToken } from '../interface/token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    appConfigService: AppConfigService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get(AppConfig.API_JWT_TOKEN),
    });
  }

  async validate(payload: PayloadToken) {
    const token: UsersTokens = await this.tokenService.verifyTokenRevoke(
      payload.sub,
    );
    if (!token || token?.is_revoked) {
      throw new UnauthorizedException('Token has been revoked already...');
    }
    return token.users;
  }
}
