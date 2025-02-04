import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { HappinessImportService } from './happiness-import.service';
import { Happiness } from './happiness.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { expectedHappinessImportResponse } from './expects/happiness/expected-happiness-import.response';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import axios from 'axios';
import {
  mockGetHappinessEntity,
  mockPostUpdateHappinessEntity,
} from './mocks/orion/mock-happiness-orion.response';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const moduleMocker = new ModuleMocker(global);

describe('HappinessImportService', () => {
  let happinessImportService: HappinessImportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessImportService],
    })
      .useMocker((token) => {
        if (token === getRepositoryToken(Happiness)) {
          return { clear: jest.fn().mockResolvedValue(true) };
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

    happinessImportService = module.get<HappinessImportService>(
      HappinessImportService,
    );
  });

  describe('importCsv', () => {
    it('should import CSV data correctly', async () => {
      const spyGet = mockedAxios.get
        .mockResolvedValueOnce(mockGetHappinessEntity)
        .mockResolvedValue({ data: [] });
      const spyPost = mockedAxios.post.mockResolvedValue(
        mockPostUpdateHappinessEntity,
      );
      const header =
        'ニックネーム,年代,住所,送信日時,緯度,経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6';
      const csvData =
        'nickname,30代,東京都新宿区,2023-06-27 12:34:56,35.6895,139.6917,東京都渋谷区,1,0,1,1,1,0';
      const csvString = header + '\n' + csvData;
      const csvFile = { buffer: Buffer.from(csvString) } as Express.Multer.File;

      const result = await happinessImportService.importCsv(csvFile, true);

      const uuidv4Pattern =
        /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;

      expect(spyGet).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
          params: {
            type: 'happiness',
            attrs: '__NONE',
            limit: '1000',
          },
        },
      );
      expect(spyPost).toHaveBeenNthCalledWith(
        1,
        `${process.env.ORION_URI}/v2/op/update`,
        {
          actionType: 'delete',
          entities: [
            {
              id: 'c28dd82f-922d-437c-a9f9-1f24f97aee50',
              type: 'happiness',
            },
            {
              id: '174bce31-0a05-4ed4-96b2-afa80ef939bd',
              type: 'happiness',
            },
            {
              id: 'fd690c01-c9bc-48e7-a386-6654ae043fdc',
              type: 'happiness',
            },
          ],
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(spyPost).toHaveBeenNthCalledWith(
        2,
        `${process.env.ORION_URI}/v2/op/update`,
        {
          actionType: 'append_strict',
          entities: [
            {
              id: expect.stringMatching(uuidv4Pattern),
              type: 'happiness',
              happiness1: { type: 'Number', value: 1 },
              happiness2: { type: 'Number', value: 0 },
              happiness3: { type: 'Number', value: 1 },
              happiness4: { type: 'Number', value: 1 },
              happiness5: { type: 'Number', value: 1 },
              happiness6: { type: 'Number', value: 0 },
              timestamp: {
                type: 'DateTime',
                value: '2023-06-27T12:34:56.000+09:00',
              },
              nickname: { type: 'Text', value: 'nickname' },
              location: {
                type: 'geo:json',
                value: {
                  type: 'Point',
                  coordinates: [139.6917, 35.6895],
                },
                metadata: {
                  place: {
                    type: 'Text',
                    value: '東京都渋谷区',
                  },
                },
              },
              age: { type: 'Text', value: '30代' },
              address: {
                type: 'Text',
                value: '東京都新宿区',
              },
              memo: { type: 'Text', value: '' },
            },
          ],
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(expectedHappinessImportResponse);
    });

    it('should import CSV data correctly even if memo are added', async () => {
      const spyGet = mockedAxios.get
        .mockResolvedValueOnce(mockGetHappinessEntity)
        .mockResolvedValue({ data: [] });
      const spyPost = mockedAxios.post.mockResolvedValue(
        mockPostUpdateHappinessEntity,
      );
      const header =
        'ニックネーム,年代,住所,送信日時,緯度,経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6,メモ';
      const csvData =
        'nickname,30代,東京都新宿区,2023-06-27 12:34:56,35.6895,139.6917,東京都渋谷区,1,0,1,1,1,0,ダミーメモ';
      const csvString = header + '\n' + csvData;
      const csvFile = { buffer: Buffer.from(csvString) } as Express.Multer.File;

      const result = await happinessImportService.importCsv(csvFile, true);

      const uuidv4Pattern =
        /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;

      expect(spyGet).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
          params: {
            type: 'happiness',
            attrs: '__NONE',
            limit: '1000',
          },
        },
      );
      expect(spyPost).toHaveBeenNthCalledWith(
        3,
        `${process.env.ORION_URI}/v2/op/update`,
        {
          actionType: 'delete',
          entities: [
            {
              id: 'c28dd82f-922d-437c-a9f9-1f24f97aee50',
              type: 'happiness',
            },
            {
              id: '174bce31-0a05-4ed4-96b2-afa80ef939bd',
              type: 'happiness',
            },
            {
              id: 'fd690c01-c9bc-48e7-a386-6654ae043fdc',
              type: 'happiness',
            },
          ],
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(spyPost).toHaveBeenNthCalledWith(
        4,
        `${process.env.ORION_URI}/v2/op/update`,
        {
          actionType: 'append_strict',
          entities: [
            {
              id: expect.stringMatching(uuidv4Pattern),
              type: 'happiness',
              happiness1: { type: 'Number', value: 1 },
              happiness2: { type: 'Number', value: 0 },
              happiness3: { type: 'Number', value: 1 },
              happiness4: { type: 'Number', value: 1 },
              happiness5: { type: 'Number', value: 1 },
              happiness6: { type: 'Number', value: 0 },
              timestamp: {
                type: 'DateTime',
                value: '2023-06-27T12:34:56.000+09:00',
              },
              nickname: { type: 'Text', value: 'nickname' },
              location: {
                type: 'geo:json',
                value: {
                  type: 'Point',
                  coordinates: [139.6917, 35.6895],
                },
                metadata: {
                  place: {
                    type: 'Text',
                    value: '東京都渋谷区',
                  },
                },
              },
              age: { type: 'Text', value: '30代' },
              address: {
                type: 'Text',
                value: '東京都新宿区',
              },
              memo: { type: 'Text', value: 'ダミーメモ' },
            },
          ],
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(expectedHappinessImportResponse);
    });

    it('should throw BadRequestException if CSV headers are incorrect', async () => {
      const header = 'incorrect,header,row';
      const errorCsvFile = {
        buffer: Buffer.from(header),
      } as Express.Multer.File;

      await expect(
        happinessImportService.importCsv(errorCsvFile, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if DateTime is incorrect', async () => {
      const header =
        'ニックネーム,年代,住所,送信日時,緯度,経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6,メモ';
      const csvData =
        'nickname,30代,東京都新宿区,abc,35.6895,139.6917,東京都渋谷区,1,0,1,1,1,0,ダミーメモ';
      const csvString = header + '\n' + csvData;
      const errorCsvFile = {
        buffer: Buffer.from(csvString),
      } as Express.Multer.File;

      await expect(
        happinessImportService.importCsv(errorCsvFile, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if validation failed', async () => {
      const header =
        'ニックネーム,年代,住所,送信日時,緯度,経度,送信住所,happiness1,happiness2,happiness3,happiness4,happiness5,happiness6,メモ';
      const csvData =
        'nickname,30代,東京都新宿区,2023-06-27 12:34:56,35.6895,139.6917,東京都渋谷区,0,0,0,0,0,0,ダミーメモ';
      const csvString = header + '\n' + csvData;
      const errorCsvFile = {
        buffer: Buffer.from(csvString),
      } as Express.Multer.File;

      await expect(
        happinessImportService.importCsv(errorCsvFile, false),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if not CSV File', async () => {
      const notCsvString = 'This is not csv file';
      const errorCsvFile = {
        buffer: Buffer.from(notCsvString),
      } as Express.Multer.File;

      await expect(
        happinessImportService.importCsv(errorCsvFile, false),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
