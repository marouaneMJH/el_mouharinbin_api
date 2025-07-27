import { NestFactory } from '@nestjs/core';
import { NoFapApiGatewayModule } from './no-fap-api-gateway.module';

async function bootstrap() {
  const app = await NestFactory.create(NoFapApiGatewayModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
