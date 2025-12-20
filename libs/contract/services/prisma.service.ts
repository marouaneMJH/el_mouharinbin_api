import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaClient } from './../prisma/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // logger: Logger = new Logger();
  constructor(private configService: ConfigService) {
    // The Database URL is constructed from environment variables
    const url: string = `postgresql://${configService.get('POSTGRES_USER')}:${configService.get('POSTGRES_PASSWORD')}@${configService.get('POSTGRES_HOST', 'localhost')}:${configService.get('POSTGRES_PORT')}/${configService.get('POSTGRES_DB')}?schema=public`;
    console.log(url);
    super({
      datasources: {
        db: {
          url,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
