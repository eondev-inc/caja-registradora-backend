import { Injectable, Logger, Scope } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppConfig } from '@/config/app/enums/app-config.enum';
import { AppConfigService } from '@/config/app/app-config.service';

@Injectable({ scope: Scope.REQUEST })
export class Supabase {
  private readonly logger = new Logger(Supabase.name);
  private clientInstance: SupabaseClient;

  constructor(private readonly appConfigService: AppConfigService) {}

  getClient() {
    this.logger.log('getting supabase client...', Supabase.name);
    if (this.clientInstance) {
      this.logger.log(
        'client exists - returning for current Scope.REQUEST',
        Supabase.name,
      );
      return this.clientInstance;
    }

    this.logger.log(
      'initialising new supabase client for new Scope.REQUEST',
      Supabase.name,
    );

    this.clientInstance = createClient(
      this.appConfigService.get(AppConfig.SUPABASE_URL),
      this.appConfigService.get(AppConfig.SUPABASE_KEY),
      {
        auth: {
          autoRefreshToken: true,
        },
      },
    );

    return this.clientInstance;
  }
}
