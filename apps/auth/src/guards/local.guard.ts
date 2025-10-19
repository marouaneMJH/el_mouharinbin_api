import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { UserI } from '../../../../libs/contract/interfaces/user.interface';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  private readonly logger: Logger = new Logger(this.constructor.name);

  getRequest(context: ExecutionContext): { body: any } {
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    this.logger.log(`data:${JSON.stringify(data)}`);

    return {
      body: data,
    };
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser = UserI>(
    err: any,
    user: UserI,
    info: any,
    context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      this.logger.error('Authentication failed:', { err, info });
      throw err || new UnauthorizedException('Invalid credentials');
    }

    // For microservices, we need to attach the user to the RPC context
    const rpcContext = context.switchToRpc();
    const data = rpcContext.getData();

    // Modify the payload to include the validated user
    Object.assign(data, user);

    this.logger.debug('User authenticated successfully:', {
      userId: user.id,
      email: user.email,
    });

    return user as TUser;
  }
}
