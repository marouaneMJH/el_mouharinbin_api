import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserI } from 'libs/contract/interfaces/user.interface';
import { UserStatus } from 'libs/contract/enums/user.enum';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  getRequest(context: ExecutionContext) {
    // On est en contexte microservice (TCP, NATS, etc.)
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData(); // payload envoyé par le client

    // On simule un "req" pour Passport
    return {
      body: data,
    };
  }

  canActivate(context: ExecutionContext) {
    console.log('[1] LocalGuard activé');
    return super.canActivate(context);
  }
}
