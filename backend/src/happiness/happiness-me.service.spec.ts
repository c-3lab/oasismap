import { Test, TestingModule } from '@nestjs/testing';
import { HappinessMeService } from './happiness-me.service';
import { mockHappinessMeEntities } from './mocks/orion/mock-happiness-orion.response';
import { expectedHappinessMeResponse } from './expects/happiness/expected-happiness-me.response';
import axios from 'axios';
import { UserAttribute } from 'src/auth/interface/user-attribute';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HappinessMeService', () => {
  let happinessMeService: HappinessMeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessMeService],
    }).compile();

    happinessMeService = module.get<HappinessMeService>(HappinessMeService);
  });

  describe('findHappinessMe', () => {
    it('should return happiness entities', async () => {
      const spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

      const requestUserAttributes: UserAttribute = {
        nickname: 'nickname',
        age: '20代',
        prefecture: '東京都',
        city: '文京区',
      };
      const start = '2024-01-01T14:30:00+09:00';
      const end = '2024-03-31T23:59:59+09:00';
      const limit = '100';
      const offset = '200';
      const result = await happinessMeService.findHappinessMe(
        requestUserAttributes,
        start,
        end,
        limit,
        offset,
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'nickname==nickname;timestamp>=2024-01-01T05:30:00.000Z;timestamp<=2024-03-31T14:59:59.000Z',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });
      // Test that we get 100 pins with correct structure
      expect(result.count).toBe(100);
      expect(result.data).toHaveLength(100);
      
      // Test first pin structure
      const firstPin = result.data[0];
      expect(firstPin).toHaveProperty('id');
      expect(firstPin).toHaveProperty('entityId');
      expect(firstPin).toHaveProperty('type');
      expect(firstPin).toHaveProperty('location');
      expect(firstPin).toHaveProperty('timestamp');
      expect(firstPin).toHaveProperty('memo');
      expect(firstPin).toHaveProperty('answers');
      
      // Test answers structure
      expect(firstPin.answers).toHaveProperty('happiness1');
      expect(firstPin.answers).toHaveProperty('happiness2');
      expect(firstPin.answers).toHaveProperty('happiness3');
      expect(firstPin.answers).toHaveProperty('happiness4');
      expect(firstPin.answers).toHaveProperty('happiness5');
      expect(firstPin.answers).toHaveProperty('happiness6');
      
      // Test location structure
      expect(firstPin.location).toHaveProperty('type', 'geo:json');
      expect(firstPin.location.value).toHaveProperty('type', 'Point');
      expect(firstPin.location.value.coordinates).toHaveLength(2);
    });
  });
});
