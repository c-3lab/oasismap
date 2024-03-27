import { Test, TestingModule } from '@nestjs/testing';
import { HappinessExportService } from './happiness-export.service';
import { Happiness } from './happiness.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockHappinessRecord } from './mocks/postgres/mock-happiness-record';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);

describe('HappinessExportService', () => {
  let happinessExportService: HappinessExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessExportService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Happiness)) {
          return { find: jest.fn().mockResolvedValue(mockHappinessRecord) };
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

    happinessExportService = module.get<HappinessExportService>(
      HappinessExportService,
    );
  });

  describe('exportCsv', () => {
    it('should return happiness response', async () => {
      const result = await happinessExportService.exportCsv();

      const header =
        'ニックネーム,年代,住所,送信日時,送信緯度,送信経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6';
      const csvData =
        'nickname,20代,東京都文京区,2024-03-16 14:02:38,35.629327,139.72382,東京都品川区,1,1,1,1,1,1';
      const csvString = header + '\n' + csvData;
      const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
      const expected = new Uint8Array([
        ...bom,
        ...new TextEncoder().encode(csvString),
      ]);
      expect(result).toEqual(expected);
    });
  });
});
