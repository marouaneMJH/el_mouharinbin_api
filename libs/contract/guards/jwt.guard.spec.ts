import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';
import { UserStatus } from '../enums/user.enum';
import JwtPayloadI from '../interfaces/jwt-paylaod.interface';

// Minimal ExecutionContext mock that provides switchToHttp().getRequest()
const makeCtx = (req: any = {}): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => req,
    }),
  } as unknown as ExecutionContext;
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    // JwtService isn't used by handleRequest, provide a stub
    guard = new JwtAuthGuard({} as any);
  });

  it('returns the user when status is ACTIVE', () => {
    const user: JwtPayloadI = {
      id: 'user-1',
      email: 'test@example.com',
      status: UserStatus.ACTIVE,
    };

    const ctx = makeCtx({ headers: {} });
    const result = guard.handleRequest(null, user, null, ctx);
    expect(result).toBe(user);
  });

  it('throws UnauthorizedException when status is not ACTIVE', () => {
    const user: JwtPayloadI = {
      id: 'user-2',
      email: 'inactive@example.com',
      status: UserStatus.INACTIVE,
    };

    const ctx = makeCtx({ headers: {} });
    expect(() => guard.handleRequest(null, user, null, ctx)).toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException with message "Invalid token" when no user', () => {
    const ctx = makeCtx({});
    expect(() => guard.handleRequest(null, null as any, null, ctx)).toThrow(
      'Invalid token',
    );
  });

  it('throws the passed error when err is provided', () => {
    const ctx = makeCtx({});
    const err = new Error('boom');
    expect(() => guard.handleRequest(err, undefined as any, null, ctx)).toThrow(
      err,
    );
  });
});
