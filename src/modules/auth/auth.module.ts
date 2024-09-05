import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigService } from '@/config/app/app-config.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@/config/app/app-config.module';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { PassportModule } from '@nestjs/passport';
import { SupabaseStrategy } from './strategies/supabase.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { forwardRef, Module } from '@nestjs/common';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    PassportModule,
    forwardRef(() => SupabaseModule),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (AppConfigService: AppConfigService) => {
        return {
          secret: AppConfigService.get(AppConfig.SUPABASE_JWT_SECRET),
        };
      },
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AppConfigService, SupabaseStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
