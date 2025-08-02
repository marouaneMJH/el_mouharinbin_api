import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../src/generated/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  // debug
  // enableShutdownHooks(app: any) {
  //   this.$on('beforeExit', async () => {
  //     await app.close();
  //   });
  // }
}
