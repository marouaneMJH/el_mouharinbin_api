import { NestFactory } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { MicroservicesModule } from '@nestjs/microservices/microservices-module';
import servicesOptions from '../../../libs/contract/config/services-options';
import { RpcCatchInterceptor } from '../../../libs/contract/interceptors/rpc-catch.interceptor';

async function bootstrap() {
  const authClientServiceOptions = servicesOptions['auth'][0];

  const app = await NestFactory.createMicroservice<MicroservicesModule>(
    AuthModule,
    authClientServiceOptions,
  );

  app.useGlobalInterceptors(new RpcCatchInterceptor());

  await app.listen();
}
(() => bootstrap())();
