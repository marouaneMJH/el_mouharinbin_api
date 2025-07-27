import { Module } from '@nestjs/common';
import { NoFapApiGatewayController } from './no-fap-api-gateway.controller';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';

@Module({
  imports: [],
  controllers: [NoFapApiGatewayController],
  providers: [NoFapApiGatewayService],
})
export class NoFapApiGatewayModule {}
