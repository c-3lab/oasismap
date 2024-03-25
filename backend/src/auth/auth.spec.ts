import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth';
import { JwtPayload } from 'jsonwebtoken';

import fetchMock from 'fetch-mock';
import createJWKSMock from 'mock-jwks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // トークンにBearerが無い場合
  it('not Bearer', async () => {
    await expect(service.verifyAuthorization('InvalidToken')).rejects.toThrow(UnauthorizedException);
  });

  // admin認証失敗
  it('verifyAdminAuthorization failed', async () => {
    const token = 'Bearer validToken';
    const invalidToken = {
      azp: 'InvalidClientId',
    };

    jest.spyOn(service, 'verifyAuthorization').mockResolvedValue(invalidToken as any);

    await expect(service.verifyAdminAuthorization(token)).rejects.toThrow(UnauthorizedException);
  });

  // 仮 mock
  it('getUserAttributeFromAuthorization', async () => {
    const token = 'Bearer validToken';
    const decodedToken = {
      nickname: 'testuser',
      age: 10,
      prefecture: '東京',
      city: '新宿',
    };

    jest.spyOn(service, 'verifyAuthorization').mockResolvedValue(decodedToken as JwtPayload);

    const userAttribute = await service.getUserAttributeFromAuthorization(token);

    expect(userAttribute).toEqual(decodedToken);
  });

  // 修正中
  it('getUserAttributeFromAuthorization', async () => {
    const token = 'Bearer validToken';
    const decodedToken = {
      nickname: 'testuser',
      age: 10,
      prefecture: '東京',
      city: '新宿',
    };

    const jwksMock = createJWKSMock(
        'https://keycloak.somedomain.com',
        '/auth/realm/application/protocol/openid-connect/certs'
      )

    fetchMock.mock('http://example.com', 200);
    fetchMock.get('http://localhost:3000/.well-known/openid-configuration', {
        jwks_uri: 'http://localhost:3000/jwks',
    });
    //   // We start our app.
    //   const server = service.verifyAuthorization({
    //     jwksUri:
    //       'https://keycloak.somedomain.com/auth/realm/application/protocol/openid-connect/certs',
    //   }).listen()
    //   const request = supertest(server)
    //   jwksMock.start()
    //   const access_token = jwksMock.token({
    //     aud: 'private',
    //     iss: 'master',
    //   })
    //   const { status } = await request
    //     .get('/')
    //     .set('Authorization', `Bearer ${access_token}`)
    //   await tearDown({ jwksMock, server })
    //   expect(status).toEqual(200)
    //})

    jwksMock.on('get', '/jwks', {
        keys: [
          {
            nickname: 'testuser',
            age: 10,
            prefecture: '東京',
            city: '新宿',
          },
        ],
      });

  
    //expect(result).toBeDefined();
    const userAttribute = await service.getUserAttributeFromAuthorization(token);

    expect(userAttribute).toEqual(decodedToken);
  });
});
