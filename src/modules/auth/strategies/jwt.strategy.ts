import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { AppConfigService } from '@/config/app/app-config.service';
import { PrismaService } from 'nestjs-prisma';
import { users } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    appConfigService: AppConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get(AppConfig.API_JWT_TOKEN),
    });
  }

  async validate(user: users) {
    this.logger.debug(`Validating user ${user}`);
    return await this.prismaService.users.findFirst({
      where: { id: user.id },
    });
  }
}
