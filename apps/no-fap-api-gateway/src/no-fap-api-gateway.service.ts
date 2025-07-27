import { Injectable } from '@nestjs/common';

@Injectable()
export class NoFapApiGatewayService {
  getHello(): string {
    return 'Hello World!';
  }
}
