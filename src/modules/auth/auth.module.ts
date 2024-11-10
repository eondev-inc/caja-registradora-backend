import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigService } from '@/config/app/app-config.service';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@/config/app/app-config.module';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { Module } from '@nestjs/common';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (appConfigService: AppConfigService) => {
        const secret = appConfigService.get(AppConfig.API_JWT_TOKEN);
        return {
          secret,
          signOptions: { expiresIn: '4h' },
        };
      },
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AppConfigService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
