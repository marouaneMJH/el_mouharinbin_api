import { Controller, Get, UseGuards } from '@nestjs/common';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';
import { JwtAuthGuard } from '../../../libs/contract/guards/jwt.guard';

@Controller()
export class NoFapApiGatewayController {
  constructor(
    private readonly noFapApiGatewayService: NoFapApiGatewayService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.noFapApiGatewayService.getHello();
  }
}
