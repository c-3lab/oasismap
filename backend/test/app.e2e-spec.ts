import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const mockedAuthService = {
    getUserAttributeFromAuthorization: async (_authorization: string) => {
      return {
        nickname: 'dummyNickname',
        age: '40代',
        prefecture: '東京都',
        city: '杉並区',
      };
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockedAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/api/happiness/me (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/happiness/me')
      .query({
        start: '2025-01-01T00:00:00.000000Z',
        end: '2025-01-31T23:59:59.999999Z',
      })
      .expect(200)
      .expect({ count: 0, data: [] });
  });

  afterAll(async () => {
    await app.close();
  });
});
