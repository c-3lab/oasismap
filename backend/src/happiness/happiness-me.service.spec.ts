import { Test, TestingModule } from '@nestjs/testing';
import { HappinessMeService } from './happiness-me.service';
import { mockHappinessMeEntities } from './mocks/orion/mock-happiness-orion.response';
import { expectedHappinessMeResponse } from './expects/happiness/expected-happiness-me.response';
import { mockHappinessMeResponse } from './mocks/happiness/mock-happiness-me.response';
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
    it('should return mock data when USE_MOCK_DATA is true', async () => {
      // Set environment variable to use mock data
      process.env.USE_MOCK_DATA = 'true';

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

      // Should return mock data without calling API
      expect(result).toEqual(mockHappinessMeResponse);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return happiness entities from API when USE_MOCK_DATA is false', async () => {
      // Set environment variable to use real API
      process.env.USE_MOCK_DATA = 'false';

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
      expect(result).toEqual(expectedHappinessMeResponse);
    });
  });

  describe('findAllHappiness', () => {
    it('should return all happiness entities from API', async () => {
      const spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

      const start = '2024-01-01T14:30:00+09:00';
      const end = '2024-03-31T23:59:59+09:00';
      const limit = '100';
      const offset = '200';

      const result = await happinessMeService.findAllHappiness(
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
          q: 'timestamp>=2024-01-01T05:30:00.000Z;timestamp<=2024-03-31T14:59:59.000Z',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });
      expect(result).toEqual(expectedHappinessMeResponse);
    });

    it('should handle empty results', async () => {
      const emptyMock = { data: [] };
      const spy = mockedAxios.get.mockResolvedValue(emptyMock);

      const result = await happinessMeService.findAllHappiness(
        '2024-01-01T14:30:00+09:00',
        '2024-03-31T23:59:59+09:00',
        '100',
        '200',
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'timestamp>=2024-01-01T05:30:00.000Z;timestamp<=2024-03-31T14:59:59.000Z',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });
      expect(result).toEqual({
        count: 0,
        data: [],
      });
    });
  });

  describe('getHappinessEntities', () => {
    it('should call axios with correct parameters', async () => {
      const spy = mockedAxios.get.mockResolvedValue({ data: [] });

      await (happinessMeService as any).getHappinessEntities(
        'test-query',
        '100',
        '200',
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'test-query',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });
    });
  });

  describe('toHappinessMeResponse', () => {
    it('should convert entities to happiness me response format', () => {
      const mockEntities = [
        {
          id: 'test-1',
          type: 'happiness',
          address: { type: 'Text', value: '東京都文京区' },
          age: { type: 'Text', value: '20代' },
          nickname: { type: 'Text', value: 'testuser' },
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.72382, 35.629327],
            },
            metadata: {
              place: {
                type: 'Text',
                value: '東京都品川区',
              },
            },
          },
          timestamp: { type: 'DateTime', value: '2024-03-16T05:02:38.150Z' },
          memo: { type: 'Text', value: 'test memo' },
          happiness1: { type: 'Number', value: 1 },
          happiness2: { type: 'Number', value: 1 },
          happiness3: { type: 'Number', value: 1 },
          happiness4: { type: 'Number', value: 1 },
          happiness5: { type: 'Number', value: 1 },
          happiness6: { type: 'Number', value: 1 },
        },
      ];

      const result = (happinessMeService as any).toHappinessMeResponse(
        mockEntities,
      );

      expect(result).toHaveLength(6); // 6 happiness types
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('entityId');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('location');
      expect(result[0]).toHaveProperty('timestamp');
      expect(result[0]).toHaveProperty('memo');
      expect(result[0]).toHaveProperty('answers');

      // Check coordinate conversion (longitude,latitude -> latitude,longitude)
      expect(result[0].location.value.coordinates).toEqual([
        35.629327, 139.72382,
      ]);
    });

    it('should handle entity without memo', () => {
      const mockEntities = [
        {
          id: 'test-1',
          type: 'happiness',
          address: { type: 'Text', value: '東京都文京区' },
          age: { type: 'Text', value: '20代' },
          nickname: { type: 'Text', value: 'testuser' },
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.72382, 35.629327],
            },
            metadata: {
              place: {
                type: 'Text',
                value: '東京都品川区',
              },
            },
          },
          timestamp: { type: 'DateTime', value: '2024-03-16T05:02:38.150Z' },
          happiness1: { type: 'Number', value: 1 },
          happiness2: { type: 'Number', value: 1 },
          happiness3: { type: 'Number', value: 1 },
          happiness4: { type: 'Number', value: 1 },
          happiness5: { type: 'Number', value: 1 },
          happiness6: { type: 'Number', value: 1 },
        },
      ];

      const result = (happinessMeService as any).toHappinessMeResponse(
        mockEntities,
      );

      expect(result[0].memo).toBe(''); // Should default to empty string
    });
  });

  describe('Error handling', () => {
    it('should handle axios errors in findHappinessMe', async () => {
      process.env.USE_MOCK_DATA = 'false';
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      const requestUserAttributes: UserAttribute = {
        nickname: 'nickname',
        age: '20代',
        prefecture: '東京都',
        city: '文京区',
      };

      await expect(
        happinessMeService.findHappinessMe(
          requestUserAttributes,
          '2024-01-01T14:30:00+09:00',
          '2024-03-31T23:59:59+09:00',
          '100',
          '200',
        ),
      ).rejects.toThrow('Network error');
    });

    it('should handle axios errors in findAllHappiness', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(
        happinessMeService.findAllHappiness(
          '2024-01-01T14:30:00+09:00',
          '2024-03-31T23:59:59+09:00',
          '100',
          '200',
        ),
      ).rejects.toThrow('Network error');
    });
  });
});
