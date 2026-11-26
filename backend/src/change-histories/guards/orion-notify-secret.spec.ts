import { loadOrionNotifySecret } from './orion-notify-secret';

describe('loadOrionNotifySecret', () => {
  it('should return the secret when it satisfies the requirements', () => {
    const secret = 'a'.repeat(16) + 'B'.repeat(8) + '0123456789-_';
    expect(loadOrionNotifySecret(secret)).toBe(secret);
  });

  // 未設定のまま起動して通知を素通しにしない
  it.each([
    ['undefined', undefined],
    ['empty', ''],
  ])('should throw when the secret is %s', (_, value) => {
    expect(() => loadOrionNotifySecret(value)).toThrow(
      'ORION_NOTIFY_SECRET is not set',
    );
  });

  it.each([
    // _env の仮の値（23文字）
    ['placeholder', 'CHANGE_TO_RANDOM_STRING'],
    ['31 characters', 'a'.repeat(31)],
    // Orion がサブスクリプションで受け付けない文字
    ['double quote', 'a'.repeat(32) + '"'],
    ['semicolon', 'a'.repeat(32) + ';'],
    ['equals', 'a'.repeat(32) + '='],
    ['space', 'a'.repeat(32) + ' '],
  ])('should throw when the secret is invalid (%s)', (_, value) => {
    expect(() => loadOrionNotifySecret(value)).toThrow(
      'ORION_NOTIFY_SECRET must be at least 32 characters of [A-Za-z0-9_-]',
    );
  });

  it('should accept exactly 32 characters', () => {
    const secret = 'a'.repeat(32);
    expect(loadOrionNotifySecret(secret)).toBe(secret);
  });
});
