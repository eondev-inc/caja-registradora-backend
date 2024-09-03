import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Supabase } from './supabase.service';

@Module({
  imports: [ConfigModule],
  providers: [Supabase],
  exports: [Supabase],
})
export class SupabaseModule {}
