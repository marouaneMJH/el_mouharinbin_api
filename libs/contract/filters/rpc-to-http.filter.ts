import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const error = exception.getError();

    // If error is already an HttpException, reuse it
    if (error instanceof HttpException) {
      const status = error.getStatus();
      const res = error.getResponse();
      response.status(status).json(res);
      return;
    }

    // Otherwise, wrap in generic 500
    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
