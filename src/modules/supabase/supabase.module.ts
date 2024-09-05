import { Module } from '@nestjs/common';
import { Supabase } from './supabase.service';
import { AppConfigModule } from '@/config/app/app-config.module';

@Module({
  imports: [AppConfigModule],
  providers: [Supabase],
  exports: [Supabase],
})
export class SupabaseModule {}
