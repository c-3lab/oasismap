// Orion 通知の共有シークレットを読み込む。
// 未設定や推測しやすい値のまま起動して通知を素通しにしないよう、条件を満たさない場合は起動時に例外を投げる。

export const ORION_NOTIFY_SECRET = Symbol('ORION_NOTIFY_SECRET');

export const ORION_NOTIFY_SECRET_MIN_LENGTH = 32;

// Orion はサブスクリプションの値に使えない文字（" ' = ; ( ) < > など）があるため、英数字と - _ に限定する
const SECRET_PATTERN = new RegExp(
  `^[A-Za-z0-9_-]{${ORION_NOTIFY_SECRET_MIN_LENGTH},}$`,
);

export const loadOrionNotifySecret = (value: string | undefined): string => {
  if (!value) {
    throw new Error('ORION_NOTIFY_SECRET is not set');
  }
  if (!SECRET_PATTERN.test(value)) {
    throw new Error(
      `ORION_NOTIFY_SECRET must be at least ${ORION_NOTIFY_SECRET_MIN_LENGTH} characters of [A-Za-z0-9_-]`,
    );
  }
  return value;
};
