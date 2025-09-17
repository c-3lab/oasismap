import { Test, TestingModule } from '@nestjs/testing';
import { HappinessAllService } from './happiness-all.service';
import { mockHappinessAllEntities } from './mocks/orion/mock-happiness-orion.response';
import { expectedHappinessAllIndividualResponse } from './expects/happiness/expected-happiness-all-individual.response';
import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HappinessAllService', () => {
  let happinessAllService: HappinessAllService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessAllService],
    }).compile();

    happinessAllService = module.get<HappinessAllService>(HappinessAllService);
  });

  describe('findHappinessAll', () => {
    it('should return happinessAll entities in individual format', async () => {
      const spy = mockedAxios.get.mockResolvedValue(mockHappinessAllEntities);

      const result = await happinessAllService.findHappinessAll(
        '2024-03-15T00:00:00+09:00',
        '2024-03-20T23:59:59+09:00',
        '100',
        '200',
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'timestamp>=2024-03-14T15:00:00.000Z;timestamp<=2024-03-20T14:59:59.000Z',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });

      expect(result).toEqual(expectedHappinessAllIndividualResponse);
    });

    it('should handle empty results', async () => {
      const emptyMock = { data: [] };
      const spy = mockedAxios.get.mockResolvedValue(emptyMock);

      const result = await happinessAllService.findHappinessAll(
        '2024-03-15T00:00:00+09:00',
        '2024-03-20T23:59:59+09:00',
        '100',
        '200',
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'timestamp>=2024-03-14T15:00:00.000Z;timestamp<=2024-03-20T14:59:59.000Z',
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

      await (happinessAllService as any).getHappinessEntities(
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

  describe('generateGridEntities', () => {
    it('should generate grid entities correctly', () => {
      const mockEntities: HappinessEntity[] = [
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

      const result = (happinessAllService as any).generateGridEntities(
        13,
        mockEntities,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('gridKey');
      expect(result[0]).toHaveProperty('happinessEntities');
      expect(result[0].happinessEntities).toHaveLength(1);
    });
  });

  describe('toTilePoint', () => {
    it('should convert lat/lng to tile coordinates', () => {
      const result = (happinessAllService as any).toTilePoint(
        35.629327,
        139.72382,
        256,
      );

      expect(result).toHaveProperty('tileX');
      expect(result).toHaveProperty('tileY');
      expect(typeof result.tileX).toBe('number');
      expect(typeof result.tileY).toBe('number');
    });
  });

  describe('toCenterLatLng', () => {
    it('should convert tile coordinates to center lat/lng', () => {
      const result = (happinessAllService as any).toCenterLatLng(0, 0, 256);

      expect(result).toHaveProperty('latitude');
      expect(result).toHaveProperty('longitude');
      expect(typeof result.latitude).toBe('number');
      expect(typeof result.longitude).toBe('number');
    });
  });

  describe('toHappinessAllMapData', () => {
    it('should convert grid entities to map data', () => {
      const mockGridEntities = [
        {
          gridKey: '35.629327,139.72382',
          happinessEntities: [
            {
              id: 'test-1',
              type: 'happiness',
              location: {
                type: 'geo:json',
                value: {
                  type: 'Point',
                  coordinates: [139.72382, 35.629327],
                },
              },
              timestamp: {
                type: 'DateTime',
                value: '2024-03-16T05:02:38.150Z',
              },
              memo: { type: 'Text', value: 'test memo' },
              happiness1: { type: 'Number', value: 1 },
              happiness2: { type: 'Number', value: 1 },
              happiness3: { type: 'Number', value: 1 },
              happiness4: { type: 'Number', value: 1 },
              happiness5: { type: 'Number', value: 1 },
              happiness6: { type: 'Number', value: 1 },
            },
          ],
        },
      ];

      const result = (happinessAllService as any).toHappinessAllMapData(
        mockGridEntities,
      );

      // Get the actual gridKey from the result
      const gridKeys = Object.keys(result);
      expect(gridKeys).toHaveLength(1);

      const gridKey = gridKeys[0];
      expect(result[gridKey]).toHaveProperty('count');
      expect(result[gridKey]).toHaveProperty('data');
      expect(result[gridKey].data).toHaveLength(6); // 6 happiness types
    });
  });

  describe('averageHappiness', () => {
    it('should calculate average happiness correctly', () => {
      const mockEntities: HappinessEntity[] = [
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
          happiness2: { type: 'Number', value: 0 },
          happiness3: { type: 'Number', value: 1 },
          happiness4: { type: 'Number', value: 0 },
          happiness5: { type: 'Number', value: 1 },
          happiness6: { type: 'Number', value: 0 },
        } as HappinessEntity,
        {
          id: 'test-2',
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
          happiness1: { type: 'Number', value: 0 },
          happiness2: { type: 'Number', value: 1 },
          happiness3: { type: 'Number', value: 0 },
          happiness4: { type: 'Number', value: 1 },
          happiness5: { type: 'Number', value: 0 },
          happiness6: { type: 'Number', value: 1 },
        } as HappinessEntity,
      ];

      const result = (happinessAllService as any).averageHappiness(
        mockEntities,
        'happiness1',
      );
      expect(result).toBe(0.5); // (1 + 0) / 2
    });

    it('should return 0 for empty entities array', () => {
      const result = (happinessAllService as any).averageHappiness(
        [],
        'happiness1',
      );
      expect(result).toBe(0);
    });
  });

  describe('convertEntitiesToData', () => {
    it('should convert entities to individual data format', () => {
      const mockEntities: HappinessEntity[] = [
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

      const result = (happinessAllService as any).convertEntitiesToData(
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
      const mockEntities: HappinessEntity[] = [
        {
          id: 'test-1',
          type: 'happiness',
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
        } as HappinessEntity,
      ];

      const result = (happinessAllService as any).convertEntitiesToData(
        mockEntities,
      );

      expect(result[0].memo).toBe(''); // Should default to empty string
    });
  });

  describe('Error handling', () => {
    it('should handle axios errors', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      await expect(
        happinessAllService.findHappinessAll(
          '2024-03-15T00:00:00+09:00',
          '2024-03-20T23:59:59+09:00',
          '100',
          '200',
        ),
      ).rejects.toThrow('Network error');
    });
  });
});
