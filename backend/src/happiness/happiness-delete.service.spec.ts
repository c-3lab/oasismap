import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Happiness } from './happiness.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import axios from 'axios';
import {
  mockDeleteHappinessEntity,
  mockNotFoundFromOrion,
  mockBadRequestFromOrion,
} from './mocks/orion/mock-happiness-orion.response';
import { HappinessDeleteService } from './happiness-delete.service';
import { expectedHappinessDeleteResponse } from './expects/happiness/expected-happiness-delete.response';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const moduleMocker = new ModuleMocker(global);

describe('HappinessDeleteService', () => {
  let happinessDeleteService: HappinessDeleteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessDeleteService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Happiness)) {
          return { delete: jest.fn().mockResolvedValue(true) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    happinessDeleteService = module.get<HappinessDeleteService>(
      HappinessDeleteService,
    );
  });

  describe('exportCsv', () => {
    const id = '425e5728-038d-4f74-9cd4-121f88c38f9b';

    it('should return happiness response', async () => {
      const spyDelete = mockedAxios.delete.mockResolvedValue(
        mockDeleteHappinessEntity,
      );

      const result = await happinessDeleteService.deleteHappiness(id);

      expect(spyDelete).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities/${id}`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
        },
      );
      expect(result).toEqual(expectedHappinessDeleteResponse);
    });

    it('should throw BadRequestException', async () => {
      const spyDelete = mockedAxios.delete.mockRejectedValue(
        mockNotFoundFromOrion,
      );

      expect(spyDelete).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities/${id}`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
        },
      );

      await expect(happinessDeleteService.deleteHappiness(id)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException', async () => {
      const spyDelete = mockedAxios.delete.mockRejectedValue(
        mockBadRequestFromOrion,
      );

      expect(spyDelete).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities/${id}`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
        },
      );

      await expect(happinessDeleteService.deleteHappiness(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
