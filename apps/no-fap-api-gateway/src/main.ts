import { NestFactory } from '@nestjs/core';
import { NoFapApiGatewayModule } from './no-fap-api-gateway.module';
import { RpcToHttpExceptionFilter } from '../../../libs/contract/filters/rpc-to-http.filter';
import { RpcToHttpInterceptor } from '../../../libs/contract/interceptors/rpc-to-http.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(NoFapApiGatewayModule);

  const port = process.env.SERVICE_PORT || 3000;

  app.useGlobalInterceptors(new RpcToHttpInterceptor());

  await app.listen(port);
  console.log(`App is running on ${port}`);
}
// debug make the env files works
// console.log('ENV:', process.env);

bootstrap().catch((error) => {
  console.error('Error during running the application', error);
});
