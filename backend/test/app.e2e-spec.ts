import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthService } from './../src/auth/auth';
import axios from 'axios';

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

  beforeAll(async () => {
    // Nominatim地理コーディングAPIのみをモック化、Orionデータベースは除外
    const originalAxiosGet = axios.get;
    jest.spyOn(axios, 'get').mockImplementation((url: string, config?: any) => {
      // Nominatimの呼び出しのみをモック化
      if (url.includes('nominatim.openstreetmap.org')) {
        // モックレスポンス：固定の住所データを返す
        return Promise.resolve({
          data: {
            features: [
              {
                properties: {
                  geocoding: {
                    admin: {
                      level4: '東京都',
                      level7: '品川区',
                    },
                  },
                },
              },
            ],
          },
        });
      }
      // その他の呼び出し（Orionデータベースなど）は元のaxiosを使用
      return originalAxiosGet.call(axios, url, config);
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(mockedAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    // dummyNickname によって登録されたデータをすべて削除する。
    const response = await request(app.getHttpServer()).get('/api/happiness');
    if (response.body.count) {
      for (let i = response.body.count; 0 < i; i--) {
        const id = response.body.data[i - 1].id;
        await request(app.getHttpServer()).delete(`/api/happiness/${id}`);
      }
    }
  });

  // 登録テスト
  it('/api/happiness (POST)', () => {
    // 登録実行
    return request(app.getHttpServer())
      .post('/api/happiness')
      .send({
        latitude: 35.629327,
        longitude: 139.72382,
        memo: 'e2eテストによって追加されたデータ',
        answers: {
          happiness1: 1,
          happiness2: 1,
          happiness3: 1,
          happiness4: 1,
          happiness5: 1,
          happiness6: 1,
        },
      })
      .expect(201);
  });

  // 登録内容一覧の取得テスト
  it('/api/happiness (GET)', async () => {
    await request(app.getHttpServer())
      .post('/api/happiness')
      .send({
        latitude: 35.629327,
        longitude: 139.72382,
        memo: 'e2eテストによって追加されたデータ',
        answers: {
          happiness1: 0,
          happiness2: 0,
          happiness3: 1,
          happiness4: 1,
          happiness5: 0,
          happiness6: 1,
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/happiness')
      .expect(200);

    expect(response.body).toHaveProperty('count');
    expect(response.body).toHaveProperty('data');
    expect(response.body.count).toEqual(expect.any(Number));
    expect(response.body.data).toEqual([expect.any(Object)]);
    expect(response.body.data[0]).toEqual({
      answers: {
        happiness1: expect.any(Number),
        happiness2: expect.any(Number),
        happiness3: expect.any(Number),
        happiness4: expect.any(Number),
        happiness5: expect.any(Number),
        happiness6: expect.any(Number),
      },
      id: expect.any(String),
      location: {
        value: {
          coordinates: [expect.any(Number), expect.any(Number)],
        },
        place: expect.any(String),
      },
      memo: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('/api/happiness (DELETE)', async () => {
    await request(app.getHttpServer())
      .post('/api/happiness')
      .send({
        latitude: 35.629327,
        longitude: 139.72382,
        memo: 'e2eテストによって追加されたデータ',
        answers: {
          happiness1: 1,
          happiness2: 1,
          happiness3: 1,
          happiness4: 1,
          happiness5: 1,
          happiness6: 1,
        },
      })
      .expect(201);

    let response = await request(app.getHttpServer()).get('/api/happiness');
    const beforeCount = response.body.count;

    // 削除対象のIDを抽出
    expect(response.body.data[0].memo).toEqual(
      'e2eテストによって追加されたデータ',
    );
    const id = response.body.data[0].id;

    // 削除実行
    await request(app.getHttpServer())
      .delete(`/api/happiness/${id}`)
      .expect(200);

    response = await request(app.getHttpServer()).get('/api/happiness');
    const afterCount = response.body.count;

    // 削除前後の登録件数を比較して1件の削除を確認
    expect(afterCount).toEqual(beforeCount - 1);
  });

  it('/api/happiness/me (GET)', async () => {
    await request(app.getHttpServer())
      .post('/api/happiness')
      .send({
        latitude: 38.629327,
        longitude: 140.72382,
        memo: 'e2eテストによって追加されたデータ',
        answers: {
          happiness1: 0,
          happiness2: 1,
          happiness3: 1,
          happiness4: 0,
          happiness5: 1,
          happiness6: 1,
        },
      })
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/api/happiness/me')
      .query({
        start: '2025-01-01T00:00:00.000000Z',
        end: '2125-01-31T23:59:59.999999Z',
      });

    expect(response.body).toHaveProperty('count');
    expect(response.body.count).toEqual(1);
    expect(response.body).toHaveProperty('data');

    const types = [
      'happiness1',
      'happiness2',
      'happiness3',
      'happiness4',
      'happiness5',
      'happiness6',
    ];
    response.body.data.forEach((data, index) => {
      expect(data).toEqual({
        id: expect.any(String),
        entityId: expect.any(String),
        type: types[index],
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [38.629327, 140.72382],
          },
        },
        timestamp: expect.any(String),
        memo: 'e2eテストによって追加されたデータ',
        answers: {
          happiness1: 0,
          happiness2: 1,
          happiness3: 1,
          happiness4: 0,
          happiness5: 1,
          happiness6: 1,
        },
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
