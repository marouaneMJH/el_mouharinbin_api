import { Test, TestingModule } from '@nestjs/testing';
import { NoFapApiGatewayController } from './no-fap-api-gateway.controller';
import { NoFapApiGatewayService } from './no-fap-api-gateway.service';

describe('NoFapApiGatewayController', () => {
  let noFapApiGatewayController: NoFapApiGatewayController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [NoFapApiGatewayController],
      providers: [NoFapApiGatewayService],
    }).compile();

    noFapApiGatewayController = app.get<NoFapApiGatewayController>(NoFapApiGatewayController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(noFapApiGatewayController.getHello()).toBe('Hello World!');
    });
  });
});
