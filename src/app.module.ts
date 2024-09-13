import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from '@/config/app/app-config.module';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from 'nestjs-prisma';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { SupabaseModule } from '@/modules/supabase/supabase.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from './modules/auth/auth.module';
import { OpenRegisterModule } from './modules/open-register/open-register.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReconciliationModule } from './modules/reconciliation/reconciliation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AppConfigModule,
    HttpModule,
    PassportModule,
    SupabaseModule,
    PrismaModule.forRootAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        return {
          prismaOptions: {
            log: configService.get(AppConfig.PRISMA_LOG_OPTION),
            errorFormat: 'pretty',
          },
          explicitConnect: true,
        };
      },
      inject: [ConfigService],
    }),
    OpenRegisterModule,
    TransactionsModule,
    ReconciliationModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
