import { Test } from '@nestjs/testing';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ChangeHistoriesController } from './change-histories.controller';
import { ChangeHistoriesService } from './change-histories.service';
import { OrionNotifyTokenGuard } from './guards/orion-notify-token.guard';
import {
  ORION_NOTIFY_SECRET,
  loadOrionNotifySecret,
} from './guards/orion-notify-secret';

// POST /change-histories/notify の共有シークレット検証を HTTP リクエストから確認する。
// main.ts と同じ ValidationPipe を設定し、Guard が本文の検証より先に動くことも確認する。
describe('POST /change-histories/notify notify token', () => {
  const secret = process.env.ORION_NOTIFY_SECRET as string;
  const validBody = { subscriptionId: 'sub-001', data: [] };
  const fiwareHeaders = {
    'Fiware-Service': 'Government',
    'Fiware-ServicePath': '/Happiness',
  };

  let app: INestApplication;
  let processNotification: jest.Mock;

  beforeEach(async () => {
    processNotification = jest.fn().mockResolvedValue(undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module = await Test.createTestingModule({
      controllers: [ChangeHistoriesController],
      providers: [
        { provide: ChangeHistoriesService, useValue: { processNotification } },
        {
          provide: ORION_NOTIFY_SECRET,
          useFactory: () =>
            loadOrionNotifySecret(process.env.ORION_NOTIFY_SECRET),
        },
        OrionNotifyTokenGuard,
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  it('should accept the notification with the correct token', async () => {
    await request(app.getHttpServer())
      .post('/change-histories/notify')
      .set(fiwareHeaders)
      .set('X-Oasismap-Notify-Token', secret)
      .send(validBody)
      .expect(201)
      .expect({ success: true });

    expect(processNotification).toHaveBeenCalledTimes(1);
  });

  it('should return 401 without the token', async () => {
    await request(app.getHttpServer())
      .post('/change-histories/notify')
      .set(fiwareHeaders)
      .send(validBody)
      .expect(401);

    expect(processNotification).not.toHaveBeenCalled();
  });

  it('should return 401 with a wrong token', async () => {
    await request(app.getHttpServer())
      .post('/change-histories/notify')
      .set(fiwareHeaders)
      .set('X-Oasismap-Notify-Token', 'x'.repeat(secret.length))
      .send(validBody)
      .expect(401);

    expect(processNotification).not.toHaveBeenCalled();
  });

  // 未認証の通知は本文の検証（400）より先に 401 で拒否する
  it('should return 401 rather than 400 for an invalid body without the token', async () => {
    await request(app.getHttpServer())
      .post('/change-histories/notify')
      .send({ unexpected: true })
      .expect(401);

    expect(processNotification).not.toHaveBeenCalled();
  });

  // 正しいトークンでも、これまでどおり Fiware ヘッダや本文は検証する
  it('should still validate Fiware headers with the correct token', async () => {
    await request(app.getHttpServer())
      .post('/change-histories/notify')
      .set('X-Oasismap-Notify-Token', secret)
      .send(validBody)
      .expect(400);

    expect(processNotification).not.toHaveBeenCalled();
  });
});

// シークレットが不正な場合は、モジュール初期化（= backend の起動）に失敗する
describe('ChangeHistories notify secret on startup', () => {
  const original = process.env.ORION_NOTIFY_SECRET;

  afterEach(() => {
    process.env.ORION_NOTIFY_SECRET = original;
  });

  it.each([
    ['unset', undefined],
    ['placeholder', 'CHANGE_TO_RANDOM_STRING'],
  ])('should fail to initialize when the secret is %s', async (_, value) => {
    if (value === undefined) {
      delete process.env.ORION_NOTIFY_SECRET;
    } else {
      process.env.ORION_NOTIFY_SECRET = value;
    }

    await expect(
      Test.createTestingModule({
        controllers: [ChangeHistoriesController],
        providers: [
          { provide: ChangeHistoriesService, useValue: {} },
          {
            provide: ORION_NOTIFY_SECRET,
            useFactory: () =>
              loadOrionNotifySecret(process.env.ORION_NOTIFY_SECRET),
          },
          OrionNotifyTokenGuard,
        ],
      }).compile(),
    ).rejects.toThrow('ORION_NOTIFY_SECRET');
  });
});
