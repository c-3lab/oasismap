import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ChangeHistoriesService } from 'src/change-histories/change-histories.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import axios from 'axios';
import {
  mockDeleteHappinessEntity,
  mockNotFoundFromOrion,
  mockBadRequestFromOrion,
} from './mocks/orion/mock-happiness-orion.response';
import { HappinessDeleteService } from './happiness-delete.service';
import { expectedHappinessDeleteResponse } from './expects/happiness/expected-happiness-delete.response';
import { mockUserAttributesResponse } from './mocks/keycloak/mock-user-attribute.response';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const moduleMocker = new ModuleMocker(global);

describe('HappinessDeleteService', () => {
  let happinessDeleteService: HappinessDeleteService;
  let changeHistoriesDelete: jest.Mock;

  const id = '425e5728-038d-4f74-9cd4-121f88c38f9b';
  const entityUrl = `${process.env.ORION_URI}/v2/entities/${id}`;
  const orionHeaders = {
    'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
    'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
  };
  const ownedEntity = {
    data: { nickname: mockUserAttributesResponse.nickname },
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    changeHistoriesDelete = jest.fn().mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessDeleteService],
    })
      .useMocker((token) => {
        if (token === ChangeHistoriesService) {
          return { delete: changeHistoriesDelete };
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

  describe('deleteHappiness', () => {
    it('should delete happiness owned by the user', async () => {
      const spyGet = mockedAxios.get.mockResolvedValue(ownedEntity);
      const spyDelete = mockedAxios.delete.mockResolvedValue(
        mockDeleteHappinessEntity,
      );

      const result = await happinessDeleteService.deleteHappiness(
        mockUserAttributesResponse,
        id,
      );

      expect(spyGet).toHaveBeenCalledWith(entityUrl, {
        headers: orionHeaders,
        params: { attrs: 'nickname', options: 'keyValues' },
      });
      expect(spyDelete).toHaveBeenCalledWith(entityUrl, {
        headers: orionHeaders,
      });
      expect(changeHistoriesDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedHappinessDeleteResponse);
    });

    // 他人の投稿は削除しない
    it('should throw ForbiddenException when the user is not the owner', async () => {
      mockedAxios.get.mockResolvedValue({ data: { nickname: 'other' } });

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(ForbiddenException);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
      expect(changeHistoriesDelete).not.toHaveBeenCalled();
    });

    // 投稿に nickname が無い場合も削除しない
    it('should throw ForbiddenException when the entity has no nickname', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(ForbiddenException);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    // トークンに nickname が無い場合（undefined 同士の一致）も削除しない
    it('should throw ForbiddenException when the token has no nickname', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      await expect(
        happinessDeleteService.deleteHappiness(
          // JwtPayload 由来のため型上は string でも実行時に undefined になり得る
          {
            ...mockUserAttributesResponse,
            nickname: undefined as unknown as string,
          },
          id,
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should encode id in the orion url', async () => {
      mockedAxios.get.mockResolvedValue({ data: { nickname: 'other' } });

      await expect(
        happinessDeleteService.deleteHappiness(
          mockUserAttributesResponse,
          '../subscriptions',
        ),
      ).rejects.toThrow(ForbiddenException);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities/..%2Fsubscriptions`,
        expect.anything(),
      );
    });

    it('should throw BadRequestException when the entity is not found', async () => {
      mockedAxios.get.mockRejectedValue(mockNotFoundFromOrion);

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(BadRequestException);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when getting the entity fails', async () => {
      mockedAxios.get.mockRejectedValue(mockBadRequestFromOrion);

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the entity is deleted concurrently', async () => {
      mockedAxios.get.mockResolvedValue(ownedEntity);
      mockedAxios.delete.mockRejectedValue(mockNotFoundFromOrion);

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(BadRequestException);
      expect(changeHistoriesDelete).not.toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException when deleting the entity fails', async () => {
      mockedAxios.get.mockResolvedValue(ownedEntity);
      mockedAxios.delete.mockRejectedValue(mockBadRequestFromOrion);

      await expect(
        happinessDeleteService.deleteHappiness(mockUserAttributesResponse, id),
      ).rejects.toThrow(InternalServerErrorException);
      expect(changeHistoriesDelete).not.toHaveBeenCalled();
    });
  });
});
