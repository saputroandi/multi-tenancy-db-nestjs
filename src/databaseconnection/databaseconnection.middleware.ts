import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';

@Injectable()
export class DatabaseconnectionMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}
  async use(req: any, res: any, next: () => void) {
    let resDs: DataSource = undefined;
    const tenant = req.headers['x-tenant-id'];

    if (tenant) {
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
      } catch (e) {
        console.error('Error during Data Source initialization', e);
      }
      // req['tenantConnection'] = conn;
    }
    console.log({ body: resDs });
    next();
  }
}
