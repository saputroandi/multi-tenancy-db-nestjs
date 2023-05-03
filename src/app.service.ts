import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private config: ConfigService) {}
  getHello() {
    return { message: this.config.getOrThrow('PORT') };
  }
}
