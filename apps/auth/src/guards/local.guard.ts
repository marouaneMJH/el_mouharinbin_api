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
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    return {
      body: data,
    };
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
