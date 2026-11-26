import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import request from 'supertest';
import axios from 'axios';
import fetchMock from 'fetch-mock';
import createJWKSMock, { JWKSMock } from 'mock-jwks';
import { HappinessController } from './happiness.controller';
import { HappinessDeleteService } from './happiness-delete.service';
import { ChangeHistoriesService } from 'src/change-histories/change-histories.service';
import { AuthService } from 'src/auth/auth';
import { mockDecodedToken } from 'src/auth/mocks/mock-decoded-token';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const moduleMocker = new ModuleMocker(global);

// DELETE /api/happiness/:id の認証・認可を HTTP リクエストから確認する。
// 本物の AuthService と HappinessDeleteService を使い、外部（Keycloak の JWKS・Orion・履歴の削除）だけをモックする。
describe('DELETE /api/happiness/:id authorization', () => {
  const id = '425e5728-038d-4f74-9cd4-121f88c38f9b';
  const ownerNickname = mockDecodedToken.nickname;

  let app: INestApplication;
  let jwksMock: JWKSMock;
  let changeHistoriesDelete: jest.Mock;

  beforeAll(() => {
    fetchMock.get(
      `${process.env.KEYCLOAK_CLIENT_ISSUER}/.well-known/openid-configuration`,
      { jwks_uri: 'http://example.com/jwks' },
    );
    jwksMock = createJWKSMock('http://example.com', '/jwks');
    jwksMock.start();
  });

  afterAll(() => {
    jwksMock.stop();
    fetchMock.restore();
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    changeHistoriesDelete = jest.fn().mockResolvedValue(true);
    // Orion 上の投稿は ownerNickname のもの
    mockedAxios.get.mockResolvedValue({ data: { nickname: ownerNickname } });
    mockedAxios.delete.mockResolvedValue({ status: 204 });

    const module = await Test.createTestingModule({
      controllers: [HappinessController],
      providers: [
        AuthService,
        HappinessDeleteService,
        {
          provide: ChangeHistoriesService,
          useValue: { delete: changeHistoriesDelete },
        },
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const expectNotDeleted = () => {
    expect(mockedAxios.delete).not.toHaveBeenCalled();
    expect(changeHistoriesDelete).not.toHaveBeenCalled();
  };

  it('should delete own happiness', async () => {
    const token = jwksMock.token(mockDecodedToken);

    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect({ message: 'Happiness has been deleted.', entity_id: id });

    expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    expect(changeHistoriesDelete).toHaveBeenCalledWith(id);
  });

  // 他人の投稿
  it('should return 403 when deleting happiness of another user', async () => {
    const token = jwksMock.token({ ...mockDecodedToken, nickname: 'other' });

    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expectNotDeleted();
  });

  // nickname を持たないトークン（管理者用クライアントなど）
  it('should return 403 when token has no nickname', async () => {
    const tokenPayload: Partial<typeof mockDecodedToken> = {
      ...mockDecodedToken,
    };
    delete tokenPayload.nickname;
    const token = jwksMock.token(tokenPayload);

    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403);

    expectNotDeleted();
  });

  // Authorization ヘッダなし（以前は TypeError で 500 になっていた）
  it('should return 401 when authorization header is missing', async () => {
    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .expect(401);

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expectNotDeleted();
  });

  it.each([
    ['not Bearer scheme', () => `Basic ${jwksMock.token(mockDecodedToken)}`],
    ['empty Bearer', () => 'Bearer'],
    ['not a JWT', () => 'Bearer abc.def.ghi'],
    [
      'tampered signature',
      () => {
        const [header, payload] = jwksMock.token(mockDecodedToken).split('.');
        return `Bearer ${header}.${payload}.invalidsignature`;
      },
    ],
    [
      'different issuer',
      () =>
        `Bearer ${jwksMock.token({
          ...mockDecodedToken,
          iss: 'http://example.com/realms/other',
        })}`,
    ],
    [
      'expired token',
      () =>
        `Bearer ${jwksMock.token({
          ...mockDecodedToken,
          exp: Math.floor(Date.now() / 1000) - 60,
        })}`,
    ],
  ])('should return 401 when token is invalid (%s)', async (_, header) => {
    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .set('Authorization', header())
      .expect(401);

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expectNotDeleted();
  });
});
