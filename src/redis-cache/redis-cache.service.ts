import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { DataSource } from 'typeorm';
import { parse, stringify, toJSON, fromJSON } from 'flatted';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async saveConnectionToCache(
    key: string,
    connectionInstance: DataSource,
    ttl?: number,
  ) {
    const connectionJSON = stringify(connectionInstance);
    await this.cacheManager.set(key, connectionJSON, ttl);
  }

  async getConnectionFromCache(key: string) {
    const connectionJSON = await this.cacheManager.get(key);
    if (!connectionJSON) return connectionJSON;
    const connection = parse(connectionJSON as string);
    return connection;
  }
}
