import { forwardRef, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { AppConfigService } from '@/config/app/app-config.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PersonModule } from '../person/person.module';
import { AppConfigModule } from '@/config/app/app-config.module';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { PersonService } from '../person/person.service';
import { AuthserverService } from './authserver.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.startegy';
import { LocalStrategy } from './strategies/local.strategy';
import AgendaService from '@/commons/services/agenda.service';
import { ProfessionalModule } from '../professional/professional.module';

@Module({
  imports: [
    forwardRef(() => ProfessionalModule),
    forwardRef(() => PersonModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: async (AppConfigService: AppConfigService) => {
        return {
          secret: AppConfigService.get(AppConfig.API_JWT_TOKEN),
        };
      },
    }),
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    PersonService,
    AgendaService,
    AuthserverService,
    AppConfigService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [AuthserverService, TokenService, AuthService],
})
export class AuthModule {}
