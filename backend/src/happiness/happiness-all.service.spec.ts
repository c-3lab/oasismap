import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HappinessAllService } from './happiness-all.service';
import { mockHappinessAllEntities } from './mocks/orion/mock-happiness-orion.response';
import { mockHappinessAllEntitiesByBounds } from './mocks/orion/mock-happiness-orion.response';
import { expectedHappinesAllResponse } from './expects/happiness/expected-happiness-all.response';
import { expectedHappinesAllByBoundsResponse } from './expects/happiness/expected-happiness-all.response';
import axios from 'axios';

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
    it('should return happinessAll entities', async () => {
      const spy = mockedAxios.get.mockResolvedValue(mockHappinessAllEntities);

      const result = await happinessAllService.findHappinessAll(
        '2024-03-15T00:00:00+09:00',
        '2024-03-20T23:59:59+09:00',
        '100',
        '200',
        'day',
        13,
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

      expect(result).toEqual(expectedHappinesAllResponse);
    });

    it('should return happinessAll entities by bounds', async () => {
      const spy = mockedAxios.get
        .mockResolvedValueOnce(mockHappinessAllEntities)
        .mockResolvedValueOnce(mockHappinessAllEntitiesByBounds);

      const result = await happinessAllService.findHappinessAll(
        '2024-03-15T00:00:00+09:00',
        '2024-03-20T23:59:59+09:00',
        '100',
        '200',
        'day',
        13,
        '11.1,222.2,33.3,444.4',
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
          georel: 'coveredBy',
          geometry: 'polygon',
          coords: '11.1,444.4;11.1,222.2;33.3,222.2;33.3,444.4;11.1,444.4',
        },
      });

      expect(result).toEqual(expectedHappinesAllByBoundsResponse);
    });

    it('should throw BadRequestException for bounds with insufficient coordinates', async () => {
      const invalidBounds = '35.25795517382968,135.70603693528884';

      await expect(
        happinessAllService.findHappinessAll(
          '2024-03-15T00:00:00+09:00',
          '2024-03-20T23:59:59+09:00',
          '100',
          '200',
          'day',
          13,
          invalidBounds,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
