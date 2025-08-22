import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RpcToHttpInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        if (err instanceof RpcException) {
          const original = err.getError() as any;

          // Case 1: already an HttpException
          if (original instanceof HttpException) {
            const res: any = original.getResponse();
            const status = original.getStatus();

            // normalize status / statusCode
            const normalized = {
              ...res,
              status: res.statusCode ?? res.status ?? status,
            };

            return throwError(() => new HttpException(normalized, status));
          }

          // Case 2: plain object
          if (typeof original === 'object') {
            const status = original.statusCode ?? original.status ?? 401;

            const message = original.message || 'Internal error';

            console.log(status);

            return throwError(
              () => new HttpException({ message, status }, status),
            );
          }

          // Case 3: plain string
          if (typeof original === 'string') {
            return throwError(() => new InternalServerErrorException(original));
          }
        }

        // Fallback: not an RpcException
        return throwError(
          () =>
            new InternalServerErrorException(err?.message || 'Unknown error'),
        );
      }),
    );
  }
}
