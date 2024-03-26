import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth';
import jwt, { JwtPayload, VerifyCallback } from 'jsonwebtoken';

jest.mock('jwks-rsa', () => {
  const JwksClient = jest.fn(() => ({
    options: { jwksUri: 'https://jwks_uri' },
    getSigningKey: jest.fn().mockImplementation((_kid, callback) => {
      const mockKey = { getPublicKey: () => 'mockPublicKey' };
      callback(null, mockKey);
    }),
  }));
  return {
    __esModule: true,
    default: JwksClient,
    JwksClient: JwksClient,
  };
});

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);

    global.fetch = jest.fn().mockResolvedValue(
      Promise.resolve({
        json: async () => ({ data: { jwks_uri: 'jwks_uri' } }),
      }),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // トークンにBearerが無い場合
  it('not Bearer', async () => {
    await expect(service.verifyAuthorization('InvalidToken')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // admin認証失敗
  it('verifyAdminAuthorization failed', async () => {
    const token = 'Bearer validToken';
    const invalidToken = {
      azp: 'InvalidClientId',
    };

    jest
      .spyOn(service, 'verifyAuthorization')
      .mockResolvedValue(invalidToken as any);

    await expect(service.verifyAdminAuthorization(token)).rejects.toThrow(
      UnauthorizedException,
    );
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

    jest
      .spyOn(service, 'verifyAuthorization')
      .mockResolvedValue(decodedToken as JwtPayload);

    const userAttribute =
      await service.getUserAttributeFromAuthorization(token);

    expect(userAttribute).toEqual(decodedToken);
  });

  it('verifyAuthorization', async () => {
    const token = 'Bearer validToken';
    const decodedToken = {
      nickname: 'testuser',
      age: 10,
      prefecture: '東京',
      city: '新宿',
    };

    jest
      .spyOn(jwt, 'verify')
      .mockImplementation((_token, _secretOrPublicKey, callback) => {
        const verifyCallback = callback as VerifyCallback<JwtPayload | string>;
        verifyCallback(null, decodedToken);
      });

    const result = await service.verifyAuthorization(token);

    expect(result).toEqual(decodedToken);
  });

  it('verifyAuthorization getKey', async () => {
    const token =
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDkyMDM2NTksImlhdCI6MTcwOTIwMzM1OSwiYXV0aF90aW1lIjoxNzA5MjAyNDIwLCJqdGkiOiJmOTE5MWZmNS0zZDQwLTRmYjktYTZjYi01NzhhY2E3NjQyYTIiLCJpc3MiOiJodHRwczovL2Y5M2MtMTI2LTc2LTQ1LTg4Lm5ncm9rLWZyZWUuYXBwL3JlYWxtcy9vYXNpc21hcCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIwMGY2NWVkOS1mODY4LTQ4NDEtODgzOS02YjMzNmYwMDE4MzUiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJnZW5lcmFsLXVzZXItY2xpZW50Iiwic2Vzc2lvbl9zdGF0ZSI6ImQ3OGI1MjhlLWI1ZmQtNGM4NC1hZTdmLWE1ZTVkMDYwZGM4MiIsImFjciI6IjAiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW9hc2lzbWFwIiwib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJzaWQiOiJkNzhiNTI4ZS1iNWZkLTRjODQtYWU3Zi1hNWU1ZDA2MGRjODIiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5pY2tuYW1lIjoic2FtcGxlTmlja25hbWUiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiIxMDQ4NjY1NzM3NzE5MTA0Mjc0NzgifQ.18_2mpF6bkO5JnnXuZowmxtAWbvCUrMAPpfqzn9AcS8';

    try {
      await service.verifyAuthorization(token);
    } catch (error) {
      expect(error.response).toEqual({
        message: 'Invalid token',
        error: 'Unauthorized',
        statusCode: 401,
      });
    }
  });
});
