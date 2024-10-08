import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { AuthUser } from '@supabase/supabase-js';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { AppConfigService } from '@/config/app/app-config.service';
import { Users } from '@/generated/prisma/users/entities/users.entity';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(SupabaseStrategy.name);

  constructor(
    appConfigService: AppConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.get(AppConfig.SUPABASE_JWT_SECRET),
    });
  }

  async validate(user: AuthUser) {
    const users: Users = await this.prismaService.users.findFirst({
      where: { user_id: user.id },
    });
    return users;
  }
}
