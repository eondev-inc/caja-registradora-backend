import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { AppConfigService } from '@/config/app/app-config.service';

interface JwtPayload {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(appConfigService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get(AppConfig.API_JWT_TOKEN),
    });
  }

  /**
   * Passport llama validate() con el payload ya verificado y decodificado.
   * No es necesario ir a la DB — el token firmado garantiza la identidad.
   * El objeto retornado se adjunta a request.user.
   * @param payload - Payload JWT decodificado.
   * @returns Objeto con userId para usar en controllers/guards.
   * @throws UnauthorizedException si el payload no contiene sub.
   */
  validate(payload: JwtPayload) {
    if (!payload?.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    return { id: payload.sub, roleNames: payload.roles ?? [] };
  }
}
