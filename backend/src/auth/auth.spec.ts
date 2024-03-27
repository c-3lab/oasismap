import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth';
import { JwtPayload } from 'jsonwebtoken';
import fetchMock from 'fetch-mock';
import createJWKSMock from 'mock-jwks';
import { mockDecodedToken } from 'src/auth/mocks/mock-decoded-token';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ユーザー情報取得
  describe('getUserAttributeFromAuthorization', () => {
    it('should return userAttribute', async () => {
      jest
        .spyOn(service, 'verifyAuthorization')
        .mockResolvedValue(mockDecodedToken as JwtPayload);

      const token = 'Bearer validToken';
      const result = await service.getUserAttributeFromAuthorization(token);

      expect(service.verifyAuthorization).toHaveBeenCalledWith(token);

      const expected = {
        nickname: 'sampleNickname',
        age: '10代以下',
        prefecture: '東京',
        city: '新宿',
      };
      expect(result).toEqual(expected);
    });
  });

  describe('verifyAdminAuthorization', () => {
    it('should throw UnauthorizedException when azp is invalid', async () => {
      const invalidToken = {
        azp: 'invalidClientId',
      };
      jest
        .spyOn(service, 'verifyAuthorization')
        .mockResolvedValue(invalidToken as JwtPayload);

      const token = 'Bearer validToken';

      expect(service.verifyAdminAuthorization(token)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(service.verifyAuthorization).toHaveBeenCalledWith(token);
    });
  });

  describe('verifyAuthorization', () => {
    it('should return decodedToken', async () => {
      fetchMock.get('http://example.com/.well-known/openid-configuration', {
        jwks_uri: 'http://example.com/jwks',
      });
      const jwksMock = createJWKSMock('http://example.com', '/jwks');
      jwksMock.start();

      const token = jwksMock.token(mockDecodedToken);

      const result = await service.verifyAuthorization(`Bearer ${token}`);

      const expected = {
        iat: expect.anything(),
        auth_time: 1711619873,
        jti: '2b2a6bb5-a1d0-43c5-8551-f7cc406a50bf',
        iss: 'http://example.com/realms/oasismap',
        aud: 'account',
        sub: '862eb991-398e-4933-8684-c3b7039afbd8',
        typ: 'Bearer',
        azp: 'general-user-client',
        session_state: 'a40e1da2-6e2b-42f5-bd57-4470b61cb438',
        acr: '1',
        'allowed-origins': ['http://example.com'],
        realm_access: {
          roles: [
            'default-roles-oasismap',
            'offline_access',
            'uma_authorization',
          ],
        },
        resource_access: { account: { roles: [] } },
        scope: 'openid profile email',
        sid: 'a40e1da2-6e2b-42f5-bd57-4470b61cb438',
        email_verified: false,
        gender: '男性',
        prefecture: '東京',
        city: '新宿',
        nickname: 'sampleNickname',
        userType: 'general',
        preferred_username: '104866573771910427478',
        age: '10代以下',
      };
      expect(result).toEqual(expected);

      fetchMock.restore();
      jwksMock.stop();
    });

    // トークンにBearerが無い場合
    it('should throw UnauthorizedException when token is not Bearer', async () => {
      await expect(service.verifyAuthorization('InvalidToken')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    // idpからの公開鍵の取得失敗
    it('should throw UnauthorizedException when failed to get key', async () => {
      fetchMock.get('http://example.com/.well-known/openid-configuration', {
        jwks_uri: 'http://example.com/jwks',
      });
      fetchMock.mock('http://example.com/jwks', 400);
      const jwksMock = createJWKSMock('http://example.com', '/dummy');

      const token = jwksMock.token(mockDecodedToken);

      await expect(
        service.verifyAuthorization(`Bearer ${token}`),
      ).rejects.toThrow(UnauthorizedException);

      fetchMock.restore();
    });
  });
});
