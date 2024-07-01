import { Test, TestingModule } from '@nestjs/testing';
import { HappinessController } from './happiness.controller';
import { HappinessMeService } from './happiness-me.service';
import { AuthService } from 'src/auth/auth';
import { HappinessAllService } from './happiness-all.service';
import { GetHappinessMeDto } from './dto/get-happiness-me.dto';
import { HappinessInputService } from './happiness-input.service';
import { HappinessExportService } from './happiness-export.service';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { GetHappinessAllDto } from './dto/get-happiness-all.dto';
import { mockHappinessMeResponse } from './mocks/happiness/mock-happiness-me.response';
import { mockHappinessInputResponse } from './mocks/happiness/mock-happiness-input.response';
import { mockHappinesAllResponse } from './mocks/happiness/mock-happiness-all.response';
import { mockUserAttributesResponse } from './mocks/keycloak/mock-user-attribute.response';
import { Response } from 'express';
import { StreamableFile } from '@nestjs/common';
import { HappinessModule } from './happiness.module';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('HappinessController', () => {
  let happinessController: HappinessController;
  let authService: jest.Mocked<AuthService>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [HappinessController],
      providers: [HappinessModule],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    happinessController = module.get<HappinessController>(HappinessController);
    authService = module.get<jest.Mocked<AuthService>>(AuthService);
  });

  describe('createHappiness', () => {
    it('should return happiness response', async () => {
      // リクエストパラメータのダミーデータ
      const requestParam: CreateHappinessDto = {
        latitude: 35.629327,
        longitude: 139.72382,
        answers: {
          happiness1: 1,
          happiness2: 1,
          happiness3: 1,
          happiness4: 1,
          happiness5: 1,
          happiness6: 1,
        },
      };

      const happinessInputService = module.get<
        jest.Mocked<HappinessInputService>
      >(HappinessInputService);
      happinessInputService.postHappiness.mockResolvedValue(
        mockHappinessInputResponse,
      );
      authService.getUserAttributeFromAuthorization.mockResolvedValue(
        mockUserAttributesResponse,
      );

      const result = await happinessController.createHappiness(
        'authorization',
        requestParam,
      );

      expect(
        authService.getUserAttributeFromAuthorization,
      ).toHaveBeenCalledWith('authorization');
      expect(happinessInputService.postHappiness).toHaveBeenCalledWith(
        mockUserAttributesResponse,
        requestParam,
      );
      expect(result).toEqual(mockHappinessInputResponse);
    });
  });

  describe('getHappinessMe', () => {
    it('should return array of happiness entities', async () => {
      // リクエストパラメータのダミーデータ
      const requestParam: GetHappinessMeDto = {
        limit: '100',
        offset: '0',
        start: '2024-03-01T00:00:00+09:00',
        end: '2024-03-31T23:59:59+09:00',
      };

      const happinessMeService =
        module.get<jest.Mocked<HappinessMeService>>(HappinessMeService);
      happinessMeService.findHappinessMe.mockResolvedValue(
        mockHappinessMeResponse,
      );
      authService.getUserAttributeFromAuthorization.mockResolvedValue(
        mockUserAttributesResponse,
      );

      const result = await happinessController.getHappinessMe(
        'authorization',
        requestParam,
      );

      expect(
        authService.getUserAttributeFromAuthorization,
      ).toHaveBeenCalledWith('authorization');
      expect(happinessMeService.findHappinessMe).toHaveBeenCalledWith(
        mockUserAttributesResponse,
        requestParam.start,
        requestParam.end,
        requestParam.limit,
        requestParam.offset,
      );
      expect(result).toEqual(mockHappinessMeResponse);
    });
  });

  describe('getHappinessAll', () => {
    it('should return array of happinessAll entities', async () => {
      // リクエストパラメータのダミーデータ
      const requestParam: GetHappinessAllDto = {
        limit: '100',
        offset: '0',
        start: '2024-03-01T00:00:00+09:00',
        end: '2024-03-31T23:59:59+09:00',
        period: 'time',
        zoomLevel: 13,
      };

      const happinessAllService =
        module.get<jest.Mocked<HappinessAllService>>(HappinessAllService);
      happinessAllService.findHappinessAll.mockResolvedValue(
        mockHappinesAllResponse,
      );
      authService.verifyAuthorization.mockResolvedValue(
        mockUserAttributesResponse,
      );

      const result = await happinessController.getHappinessAll(
        'authorization',
        requestParam,
      );

      expect(authService.verifyAuthorization).toHaveBeenCalledWith(
        'authorization',
      );
      expect(happinessAllService.findHappinessAll).toHaveBeenCalledWith(
        requestParam.start,
        requestParam.end,
        requestParam.limit,
        requestParam.offset,
        requestParam.period,
        requestParam.zoomLevel,
      );
      expect(result).toEqual(mockHappinesAllResponse);
    });
  });

  describe('exportHappiness', () => {
    it('should return csv data', async () => {
      const header =
        'ニックネーム,年代,住所,送信日時,緯度,経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6';
      const csvData =
        'nickname,20代,東京都文京区,2024-03-16 14:02:38,35.629327,139.72382,東京都品川区,1,1,1,1,1,1';
      const csvString = header + '\n' + csvData;
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const mockExportCsv = new Uint8Array([
        ...bom,
        ...new TextEncoder().encode(csvString),
      ]);

      const happinessExportService = module.get<
        jest.Mocked<HappinessExportService>
      >(HappinessExportService);
      happinessExportService.exportCsv.mockResolvedValue(mockExportCsv);

      const response: Partial<Response> = {
        set: jest.fn(),
      };

      const result = await happinessController.exportHappiness(
        'authorization',
        response as Response,
      );

      expect(authService.verifyAdminAuthorization).toHaveBeenCalledWith(
        'authorization',
      );
      expect(result).toBeInstanceOf(StreamableFile);
      expect(result.getStream().read()).toEqual(Buffer.from(mockExportCsv));
    });
  });
});
