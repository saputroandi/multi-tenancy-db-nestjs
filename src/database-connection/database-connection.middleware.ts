import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisCacheService } from 'src/redis-cache/redis-cache.service';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseConnectionMiddleware implements NestMiddleware {
  constructor(
    private config: ConfigService,
    private readonly redisCacheService: RedisCacheService,
  ) {}
  async use(req: any, res: any, next: () => void) {
    let resDs: DataSource = undefined;
    const tenant = req.headers['x-tenant-id'];

    if (!tenant) {
      return next();
    }

    const connection = await this.redisCacheService.getConnectionFromCache(
      tenant,
    );

    if (!connection) {
      const connectionOptions: DataSourceOptions = {
        type: 'postgres',
        host: this.config.get('POSTGRES_HOST'),
        port: this.config.get('POSTGRES_PORT'),
        username: this.config.get('POSTGRES_USER'),
        password: this.config.get('POSTGRES_PASSWORD'),
        // database: `tenant_${tenant}`,
        database: this.config.get('POSTGRES_DATABASE'),
        // entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // synchronize: true,
      };

      const dbConnection = new DataSource(connectionOptions);

      try {
        resDs = await dbConnection.initialize();
        await this.redisCacheService.saveConnectionToCache(
          tenant,
          resDs,
          60 * 60,
        );
      } catch (e) {
        console.error('Error during Data Source initialization', e);
      }
    } else {
      resDs = connection;
    }

    req['tenantConnection'] = resDs;
    next();
  }
}
