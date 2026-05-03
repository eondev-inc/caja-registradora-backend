import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  onModuleDestroy() {
    this.client.quit();
  }

  /**
   * Guarda un valor string con TTL opcional.
   * @param key - Clave Redis.
   * @param value - Valor a guardar.
   * @param ttlSeconds - Tiempo de expiración en segundos (omitir para persistente).
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  /**
   * Obtiene un valor por clave.
   * @param key - Clave Redis.
   * @returns El valor almacenado o null si no existe.
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Elimina una clave.
   * @param key - Clave Redis a eliminar.
   */
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  /**
   * Verifica si una clave existe.
   * @param key - Clave Redis.
   * @returns true si existe.
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Incrementa un contador atómicamente y le asigna TTL si es la primera vez.
   * Usado para login-lock: la clave expira sola al vencer el TTL.
   * @param key - Clave del contador.
   * @param ttlSeconds - TTL que se aplica solo en el primer INCR.
   * @returns El valor del contador tras el incremento.
   */
  async incrementWithTtl(key: string, ttlSeconds: number): Promise<number> {
    const pipeline = this.client.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, ttlSeconds, 'NX'); // NX: solo setea si no tiene TTL aún
    const results = await pipeline.exec();
    return results[0][1] as number;
  }

  /**
   * Obtiene el TTL restante de una clave en segundos.
   * @param key - Clave Redis.
   * @returns Segundos restantes o -1 si no tiene TTL, -2 si no existe.
   */
  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}
