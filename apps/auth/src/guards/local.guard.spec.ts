import { ExecutionContext } from '@nestjs/common';
import { LocalGuard } from './local.guard';

const makeRpcCtx = (data: any): ExecutionContext => {
  return {
    switchToRpc: () => ({
      getData: () => data,
    }),
  } as unknown as ExecutionContext;
};

describe('LocalGuard', () => {
  let guard: LocalGuard;

  beforeEach(() => {
    guard = new LocalGuard();
  });

  it('maps RPC data to request.body', () => {
    const payload = { username: 'foo', password: 'bar' };
    const ctx = makeRpcCtx(payload);

    const req = guard.getRequest(ctx);

    expect(req).toBeDefined();
    expect(req.body).toEqual(payload);
  });
});
