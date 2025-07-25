import { Test, TestingModule } from '@nestjs/testing';
import { HappinessMeService } from './happiness-me.service';
import { mockHappinessMeEntities } from './mocks/orion/mock-happiness-orion.response';
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

  describe('static properties', () => {
    it('should have correct static keys', () => {
      expect(HappinessMeService.keys).toEqual([
        'happiness1',
        'happiness2',
        'happiness3',
        'happiness4',
        'happiness5',
        'happiness6',
      ]);
    });
  });

  describe('findHappinessMe', () => {
    it('should return happiness entities', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      expect(_spy).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
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
        },
      );
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

    it('should handle empty entities from Orion', async () => {
      const _spy = mockedAxios.get.mockResolvedValue({ data: [] });

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

      expect(result.count).toBe(100);
      expect(result.data).toHaveLength(100);

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();

      // Test that pins are generated even without base entity
      const firstPin = result.data[0];
      expect(firstPin).toHaveProperty('id');
      expect(firstPin).toHaveProperty('entityId');
      expect(firstPin).toHaveProperty('type');
      expect(firstPin).toHaveProperty('location');
      expect(firstPin).toHaveProperty('timestamp');
      expect(firstPin).toHaveProperty('memo');
      expect(firstPin).toHaveProperty('answers');
    });

    it('should handle different time formats', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

      const requestUserAttributes: UserAttribute = {
        nickname: 'nickname',
        age: '20代',
        prefecture: '東京都',
        city: '文京区',
      };
      const start = '2024-01-01T00:00:00Z';
      const end = '2024-12-31T23:59:59Z';
      const limit = '50';
      const offset = '0';
      const result = await happinessMeService.findHappinessMe(
        requestUserAttributes,
        start,
        end,
        limit,
        offset,
      );

      expect(result.count).toBe(100);
      expect(result.data).toHaveLength(100);

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should generate pins with different happiness types', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that pins have different types
      const types = result.data.map((pin) => pin.type);
      const uniqueTypes = [...new Set(types)];
      expect(uniqueTypes.length).toBeGreaterThan(1);

      // Test that all pins have valid happiness types
      const validTypes = [
        'happiness1',
        'happiness2',
        'happiness3',
        'happiness4',
        'happiness5',
        'happiness6',
      ];
      types.forEach((type) => {
        expect(validTypes).toContain(type);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should handle axios error gracefully', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _spy = mockedAxios.get.mockRejectedValue(
        new Error('Network error'),
      );

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

      await expect(
        happinessMeService.findHappinessMe(
          requestUserAttributes,
          start,
          end,
          limit,
          offset,
        ),
      ).rejects.toThrow('Network error');
    });
  });

  describe('private methods (tested indirectly)', () => {
    it('should test generatePinsFromBase through findHappinessMe', async () => {
      mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that generatePinsFromBase logic works correctly
      result.data.forEach((pin) => {
        expect(pin.answers.happiness1).toBeGreaterThanOrEqual(0);
        expect(pin.answers.happiness2).toBeGreaterThanOrEqual(0);
        expect(pin.answers.happiness3).toBeGreaterThanOrEqual(0);
        expect(pin.answers.happiness4).toBeGreaterThanOrEqual(0);
        expect(pin.answers.happiness5).toBeGreaterThanOrEqual(0);
        expect(pin.answers.happiness6).toBeGreaterThanOrEqual(0);

        // At least one happiness should be 1
        const values = Object.values(pin.answers);
        expect(values.some((v) => v === 1)).toBe(true);

        // Primary type should match the highest value
        const maxValue = Math.max(...values);
        const primaryType = Object.keys(pin.answers).find(
          (key) => pin.answers[key as keyof typeof pin.answers] === maxValue,
        );
        expect(pin.type).toBe(primaryType);
      });
    });

    it('should test getHappinessEntities through findHappinessMe', async () => {
      mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      await happinessMeService.findHappinessMe(
        requestUserAttributes,
        start,
        end,
        limit,
        offset,
      );

      // Verify getHappinessEntities was called correctly
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
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
        },
      );
    });

    it('should test toHappinessMeResponse logic with real entities', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that toHappinessMeResponse logic is covered
      // This tests the coordinate transformation logic
      result.data.forEach((pin) => {
        expect(pin.location.value.coordinates).toHaveLength(2);
        expect(typeof pin.location.value.coordinates[0]).toBe('number');
        expect(typeof pin.location.value.coordinates[1]).toBe('number');
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test pin generation with different happiness combinations', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that different happiness combinations are generated
      const happinessCounts = result.data.map((pin) => {
        return Object.values(pin.answers).filter((v) => v === 1).length;
      });

      // Should have pins with different numbers of happiness types (1-6)
      const uniqueCounts = [...new Set(happinessCounts)];
      expect(uniqueCounts.length).toBeGreaterThan(1);

      // All counts should be between 1 and 6
      happinessCounts.forEach((count) => {
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(6);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test memo generation logic', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that memo contains happiness type count
      result.data.forEach((pin) => {
        expect(pin.memo).toContain('Pin');
        expect(pin.memo).toContain('happiness types');

        // Extract the number from memo
        const match = pin.memo.match(/Pin \d+ with (\d+) happiness types/);
        expect(match).toBeTruthy();
        const happinessCount = parseInt(match![1]);
        expect(happinessCount).toBeGreaterThanOrEqual(1);
        expect(happinessCount).toBeLessThanOrEqual(6);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test coordinate generation logic', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that coordinates are within expected range
      const baseLat = 35.6762;
      const baseLng = 139.6503;
      const latRange = 1.0;
      const lngRange = 1.0;

      result.data.forEach((pin) => {
        const [lat, lng] = pin.location.value.coordinates;

        // Check latitude range
        expect(lat).toBeGreaterThanOrEqual(baseLat - latRange / 2);
        expect(lat).toBeLessThanOrEqual(baseLat + latRange / 2);

        // Check longitude range
        expect(lng).toBeGreaterThanOrEqual(baseLng - lngRange / 2);
        expect(lng).toBeLessThanOrEqual(baseLng + lngRange / 2);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test timestamp generation logic', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that timestamps are valid ISO strings
      result.data.forEach((pin) => {
        expect(() => new Date(pin.timestamp)).not.toThrow();
        expect(new Date(pin.timestamp).toISOString()).toBe(pin.timestamp);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test entity ID generation logic', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that entity IDs are unique
      const entityIds = result.data.map((pin) => pin.entityId);
      const uniqueEntityIds = [...new Set(entityIds)];
      expect(uniqueEntityIds.length).toBe(result.data.length);

      // Test that entity IDs follow expected pattern
      result.data.forEach((pin) => {
        expect(pin.entityId).toMatch(/^entity-\d+-\d+$/);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });

    it('should test pin ID generation logic', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

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

      // Test that pin IDs are unique
      const pinIds = result.data.map((pin) => pin.id);
      const uniquePinIds = [...new Set(pinIds)];
      expect(uniquePinIds.length).toBe(result.data.length);

      // Test that pin IDs follow expected pattern
      result.data.forEach((pin) => {
        expect(pin.id).toMatch(/^pin-\d+-\d+$/);
      });

      // Verify that axios was called
      expect(_spy).toHaveBeenCalled();
    });
  });

  describe('unused methods (for coverage)', () => {
    it('should test generateAdditionalPins method', async () => {
      // Test generateAdditionalPins by calling it directly through reflection
      const userAttribute: UserAttribute = {
        nickname: 'test-nickname',
        age: '30代',
        prefecture: '大阪府',
        city: '大阪市',
      };
      const startAsUTC = '2024-01-01T00:00:00.000Z';
      const endAsUTC = '2024-12-31T23:59:59.000Z';
      const count = 10;

      // Access private method through any type
      const service = happinessMeService as any;
      const result = service.generateAdditionalPins(
        userAttribute,
        startAsUTC,
        endAsUTC,
        count,
      );

      expect(result).toHaveLength(count);
      expect(Array.isArray(result)).toBe(true);

      // Test first entity structure
      const firstEntity = result[0];
      expect(firstEntity).toHaveProperty('id');
      expect(firstEntity).toHaveProperty('type', 'happiness');
      expect(firstEntity).toHaveProperty('timestamp');
      expect(firstEntity).toHaveProperty('nickname');
      expect(firstEntity).toHaveProperty('location');
      expect(firstEntity).toHaveProperty('age');
      expect(firstEntity).toHaveProperty('address');
      expect(firstEntity).toHaveProperty('memo');
      expect(firstEntity).toHaveProperty('happiness1');
      expect(firstEntity).toHaveProperty('happiness2');
      expect(firstEntity).toHaveProperty('happiness3');
      expect(firstEntity).toHaveProperty('happiness4');
      expect(firstEntity).toHaveProperty('happiness5');
      expect(firstEntity).toHaveProperty('happiness6');

      // Test that only one happiness has value 1
      const happinessValues = [
        firstEntity.happiness1.value,
        firstEntity.happiness2.value,
        firstEntity.happiness3.value,
        firstEntity.happiness4.value,
        firstEntity.happiness5.value,
        firstEntity.happiness6.value,
      ];
      const ones = happinessValues.filter((v) => v === 1);
      const zeros = happinessValues.filter((v) => v === 0);
      expect(ones).toHaveLength(1);
      expect(zeros).toHaveLength(5);
    });

    it('should test generateDirectPins method', async () => {
      // Test generateDirectPins by calling it directly through reflection
      const userAttribute: UserAttribute = {
        nickname: 'test-nickname',
        age: '40代',
        prefecture: '福岡県',
        city: '福岡市',
      };
      const startAsUTC = '2024-01-01T00:00:00.000Z';
      const endAsUTC = '2024-12-31T23:59:59.000Z';
      const count = 5;

      // Access private method through any type
      const service = happinessMeService as any;
      const result = service.generateDirectPins(
        userAttribute,
        startAsUTC,
        endAsUTC,
        count,
      );

      expect(result).toHaveLength(count);
      expect(Array.isArray(result)).toBe(true);

      // Test first pin structure
      const firstPin = result[0];
      expect(firstPin).toHaveProperty('id');
      expect(firstPin).toHaveProperty('entityId');
      expect(firstPin).toHaveProperty('type');
      expect(firstPin).toHaveProperty('location');
      expect(firstPin).toHaveProperty('timestamp');
      expect(firstPin).toHaveProperty('memo');
      expect(firstPin).toHaveProperty('answers');

      // Test that pin ID follows direct pattern
      expect(firstPin.id).toMatch(/^direct-\d+-\d+$/);
      expect(firstPin.entityId).toMatch(/^direct-entity-\d+-\d+$/);

      // Test that memo contains direct pin info
      expect(firstPin.memo).toContain('Direct pin');
      expect(firstPin.memo).toContain('happiness types');
    });

    it('should test toHappinessMeResponse method with error handling', async () => {
      // Test toHappinessMeResponse by calling it directly through reflection
      const mockEntities = [
        {
          id: 'test-entity-1',
          timestamp: { value: 'invalid-timestamp' }, // This will cause an error
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.6503, 35.6762],
            },
          },
          memo: { value: 'Test memo' },
          happiness1: { value: 1 },
          happiness2: { value: 0 },
          happiness3: { value: 0 },
          happiness4: { value: 0 },
          happiness5: { value: 0 },
          happiness6: { value: 0 },
        },
        {
          id: 'test-entity-2',
          timestamp: { value: '2024-01-01T00:00:00.000Z' },
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.6503, 35.6762],
            },
          },
          memo: { value: 'Test memo 2' },
          happiness1: { value: 0 },
          happiness2: { value: 1 },
          happiness3: { value: 0 },
          happiness4: { value: 0 },
          happiness5: { value: 0 },
          happiness6: { value: 0 },
        },
      ];

      // Access private method through any type
      const service = happinessMeService as any;
      const result = service.toHappinessMeResponse(mockEntities);

      // Should filter out invalid entities and return valid ones
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Test that valid entities are processed correctly
      const validPin = result.find(
        (pin) => pin.entityId === 'test-entity-2' && pin.type === 'happiness2',
      );
      expect(validPin).toBeDefined();
      expect(validPin?.type).toBe('happiness2');
      expect(validPin?.answers.happiness2).toBe(1);
    });

    it('should test toHappinessMeResponse method with empty entities', async () => {
      // Test toHappinessMeResponse with empty array
      const service = happinessMeService as any;
      const result = service.toHappinessMeResponse([]);

      expect(result).toEqual([]);
    });

    it('should test toHappinessMeResponse method with null memo', async () => {
      // Test toHappinessMeResponse with entity that has null memo
      const mockEntity = {
        id: 'test-entity-null-memo',
        timestamp: { value: '2024-01-01T00:00:00.000Z' },
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [139.6503, 35.6762],
          },
        },
        memo: null, // Null memo
        happiness1: { value: 1 },
        happiness2: { value: 0 },
        happiness3: { value: 0 },
        happiness4: { value: 0 },
        happiness5: { value: 0 },
        happiness6: { value: 0 },
      };

      const service = happinessMeService as any;
      const result = service.toHappinessMeResponse([mockEntity]);

      expect(result).toHaveLength(6); // 6 happiness types
      expect(result[0].memo).toBe(''); // Should default to empty string
    });

    it('should test toHappinessMeResponse method with undefined memo', async () => {
      // Test toHappinessMeResponse with entity that has undefined memo
      const mockEntity = {
        id: 'test-entity-undefined-memo',
        timestamp: { value: '2024-01-01T00:00:00.000Z' },
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [139.6503, 35.6762],
          },
        },
        memo: undefined, // Undefined memo
        happiness1: { value: 1 },
        happiness2: { value: 0 },
        happiness3: { value: 0 },
        happiness4: { value: 0 },
        happiness5: { value: 0 },
        happiness6: { value: 0 },
      };

      const service = happinessMeService as any;
      const result = service.toHappinessMeResponse([mockEntity]);

      expect(result).toHaveLength(6); // 6 happiness types
      expect(result[0].memo).toBe(''); // Should default to empty string
    });

    it('should test toHappinessMeResponse method with multiple entities', async () => {
      // Test toHappinessMeResponse with multiple entities
      const mockEntities = [
        {
          id: 'test-entity-1',
          timestamp: { value: '2024-01-01T00:00:00.000Z' },
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.6503, 35.6762],
            },
          },
          memo: { value: 'Test memo 1' },
          happiness1: { value: 1 },
          happiness2: { value: 0 },
          happiness3: { value: 0 },
          happiness4: { value: 0 },
          happiness5: { value: 0 },
          happiness6: { value: 0 },
        },
        {
          id: 'test-entity-2',
          timestamp: { value: '2024-01-02T00:00:00.000Z' },
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [139.6504, 35.6763],
            },
          },
          memo: { value: 'Test memo 2' },
          happiness1: { value: 0 },
          happiness2: { value: 1 },
          happiness3: { value: 0 },
          happiness4: { value: 0 },
          happiness5: { value: 0 },
          happiness6: { value: 0 },
        },
      ];

      const service = happinessMeService as any;
      const result = service.toHappinessMeResponse(mockEntities);

      expect(result).toHaveLength(12); // 2 entities * 6 happiness types

      // Test that all happiness types are generated for each entity
      const entity1Pins = result.filter(
        (pin) => pin.entityId === 'test-entity-1',
      );
      const entity2Pins = result.filter(
        (pin) => pin.entityId === 'test-entity-2',
      );

      expect(entity1Pins).toHaveLength(6);
      expect(entity2Pins).toHaveLength(6);

      // Test that coordinates are transformed correctly (longitude, latitude -> latitude, longitude)
      entity1Pins.forEach((pin) => {
        expect(pin.location.value.coordinates[0]).toBe(35.6762); // latitude
        expect(pin.location.value.coordinates[1]).toBe(139.6503); // longitude
      });
    });

    it('should test generatePinsFromBase with null baseEntity', async () => {
      // Test generatePinsFromBase with null baseEntity
      const userAttribute: UserAttribute = {
        nickname: 'test-nickname',
        age: '50代',
        prefecture: '北海道',
        city: '札幌市',
      };
      const count = 3;

      const service = happinessMeService as any;
      const result = service.generatePinsFromBase(null, userAttribute, count);

      expect(result).toHaveLength(count);
      expect(Array.isArray(result)).toBe(true);

      // Test that pins are generated correctly even without base entity
      result.forEach((pin) => {
        expect(pin).toHaveProperty('id');
        expect(pin).toHaveProperty('entityId');
        expect(pin).toHaveProperty('type');
        expect(pin).toHaveProperty('location');
        expect(pin).toHaveProperty('timestamp');
        expect(pin).toHaveProperty('memo');
        expect(pin).toHaveProperty('answers');
      });
    });

    it('should test generatePinsFromBase with valid baseEntity', async () => {
      // Test generatePinsFromBase with valid baseEntity
      const baseEntity = {
        id: 'base-entity-1',
        timestamp: { value: '2024-01-01T00:00:00.000Z' },
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [139.6503, 35.6762],
          },
        },
        memo: { value: 'Base entity memo' },
        happiness1: { value: 1 },
        happiness2: { value: 0 },
        happiness3: { value: 0 },
        happiness4: { value: 0 },
        happiness5: { value: 0 },
        happiness6: { value: 0 },
      };

      const userAttribute: UserAttribute = {
        nickname: 'test-nickname',
        age: '60代',
        prefecture: '沖縄県',
        city: '那覇市',
      };
      const count = 2;

      const service = happinessMeService as any;
      const result = service.generatePinsFromBase(
        baseEntity,
        userAttribute,
        count,
      );

      expect(result).toHaveLength(count);
      expect(Array.isArray(result)).toBe(true);

      // Test that pins are generated correctly with base entity
      result.forEach((pin) => {
        expect(pin).toHaveProperty('id');
        expect(pin).toHaveProperty('entityId');
        expect(pin).toHaveProperty('type');
        expect(pin).toHaveProperty('location');
        expect(pin).toHaveProperty('timestamp');
        expect(pin).toHaveProperty('memo');
        expect(pin).toHaveProperty('answers');
      });
    });

    it('should test getHappinessEntities method', async () => {
      const _spy = mockedAxios.get.mockResolvedValue(mockHappinessMeEntities);

      const service = happinessMeService as any;
      const result = await service.getHappinessEntities(
        'test-query',
        '10',
        '0',
      );

      expect(_spy).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
          params: {
            q: 'test-query',
            limit: '10',
            offset: '0',
            orderBy: '!timestamp',
          },
        },
      );

      expect(result).toEqual(mockHappinessMeEntities.data);
    });
  });
});
