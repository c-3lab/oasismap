import {
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { OrionNotifyTokenGuard } from './orion-notify-token.guard';

describe('OrionNotifyTokenGuard', () => {
  const secret = 'test-notify-secret-0123456789abcdef';
  let guard: OrionNotifyTokenGuard;
  let warnSpy: jest.SpyInstance;

  const contextWithHeaders = (
    headers: Record<string, string | string[] | undefined>,
  ): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers, ip: '10.0.0.1' }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    guard = new OrionNotifyTokenGuard(secret);
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should allow the request with the correct token', () => {
    expect(
      guard.canActivate(
        contextWithHeaders({ 'x-oasismap-notify-token': secret }),
      ),
    ).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', {}],
    ['empty', { 'x-oasismap-notify-token': '' }],
    // 型が string 以外（配列）の場合も受け付けない
    ['array', { 'x-oasismap-notify-token': [secret] }],
  ])('should reject when the token is %s', (_, headers) => {
    expect(() => guard.canActivate(contextWithHeaders(headers))).toThrow(
      new UnauthorizedException('Notify token is required'),
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('header is missing'),
    );
  });

  it.each([
    ['different value', 'x'.repeat(secret.length)],
    ['prefix of the secret', secret.slice(0, -1)],
    ['secret with suffix', secret + 'x'],
    ['different case', secret.toUpperCase()],
  ])('should reject when the token is invalid (%s)', (_, token) => {
    expect(() =>
      guard.canActivate(
        contextWithHeaders({ 'x-oasismap-notify-token': token }),
      ),
    ).toThrow(new UnauthorizedException('Invalid notify token'));
  });

  // 拒否時のログに受け取った値やシークレットを出さない
  it('should not log the token value', () => {
    const token = 'wrong-token-value-should-not-be-logged';
    expect(() =>
      guard.canActivate(
        contextWithHeaders({ 'x-oasismap-notify-token': token }),
      ),
    ).toThrow(UnauthorizedException);

    const logged = warnSpy.mock.calls.flat().join(' ');
    expect(logged).not.toContain(token);
    expect(logged).not.toContain(secret);
  });
});
