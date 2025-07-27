import { Controller, Get } from '@nestjs/common';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';

@Controller()
export class NoFapApiGatewayController {
  constructor(private readonly noFapApiGatewayService: NoFapApiGatewayService) {}

  @Get()
  getHello(): string {
    return this.noFapApiGatewayService.getHello();
  }
}
