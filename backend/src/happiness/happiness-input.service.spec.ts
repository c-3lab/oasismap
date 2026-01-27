import { Test, TestingModule } from '@nestjs/testing';
import { HappinessInputService } from './happiness-input.service';
import { expectedHappinessInputResponse } from './expects/happiness/expected-happiness-input.response';
import axios from 'axios';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { mockGeocodingResponse } from './mocks/geocoding/mock-geocoding.response';
import { mockPostHappinessEntity } from './mocks/orion/mock-happiness-orion.response';
import { UserAttribute } from 'src/auth/interface/user-attribute';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HappinessInputService', () => {
  let happinessInputService: HappinessInputService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessInputService],
    }).compile();

    happinessInputService = module.get<HappinessInputService>(
      HappinessInputService,
    );
  });

  describe('postHappiness', () => {
    // リクエストパラメータのダミーデータ
    const requestUserAttributes: UserAttribute = {
      nickname: 'nickname',
      age: '20代',
      prefecture: '東京都',
      city: '文京区',
    };

    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
    };

    const requestParamWithTimestamp: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 1,
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
        happiness6: 1,
      },
      timestamp: '2024-12-19T09:00:00.000Z',
    };

    it('should return happiness response', async () => {
      const spyGet = mockedAxios.get.mockResolvedValue(mockGeocodingResponse);
      const spyPost = mockedAxios.post.mockResolvedValue(
        mockPostHappinessEntity,
      );

      const result = await happinessInputService.postHappiness(
        requestUserAttributes,
        requestParam,
      );

      const uuidv4Pattern =
        /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;
      const iso8601Pattern =
        /([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2}).([0-9]{3})Z/;

      expect(spyGet).toHaveBeenCalledWith(process.env.REVERSE_GEOCODING_URL, {
        params: {
          lat: 35.629327,
          lon: 139.72382,
          format: 'geocodejson',
          zoom: 10,
        },
        headers: {
          'User-Agent': 'OasisMap (TIS_WB@ml.tis.co.jp)',
        },
      });
      expect(spyPost).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
          id: expect.stringMatching(uuidv4Pattern),
          type: 'happiness',
          happiness1: { type: 'Number', value: 1 },
          happiness2: { type: 'Number', value: 1 },
          happiness3: { type: 'Number', value: 1 },
          happiness4: { type: 'Number', value: 1 },
          happiness5: { type: 'Number', value: 1 },
          happiness6: { type: 'Number', value: 1 },
          timestamp: {
            type: 'DateTime',
            value: expect.stringMatching(iso8601Pattern),
          },
          nickname: { type: 'Text', value: 'nickname' },
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
          age: { type: 'Text', value: '20代' },
          address: {
            type: 'Text',
            value: '東京都文京区',
          },
          memo: { type: 'Text', value: 'ダミーメモ' },
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(expectedHappinessInputResponse);
    });

    it('should return happiness response with past timestamp', async () => {
      const spyGet = mockedAxios.get.mockResolvedValue(mockGeocodingResponse);
      const spyPost = mockedAxios.post.mockResolvedValue(
        mockPostHappinessEntity,
      );

      const result = await happinessInputService.postHappiness(
        requestUserAttributes,
        requestParamWithTimestamp,
      );

      const uuidv4Pattern =
        /([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})/;

      expect(spyGet).toHaveBeenCalledWith(process.env.REVERSE_GEOCODING_URL, {
        params: {
          lat: 35.629327,
          lon: 139.72382,
          format: 'geocodejson',
          zoom: 10,
        },
        headers: {
          'User-Agent': 'OasisMap (TIS_WB@ml.tis.co.jp)',
        },
      });
      expect(spyPost).toHaveBeenCalledWith(
        `${process.env.ORION_URI}/v2/entities`,
        {
          id: expect.stringMatching(uuidv4Pattern),
          type: 'happiness',
          happiness1: { type: 'Number', value: 1 },
          happiness2: { type: 'Number', value: 1 },
          happiness3: { type: 'Number', value: 1 },
          happiness4: { type: 'Number', value: 1 },
          happiness5: { type: 'Number', value: 1 },
          happiness6: { type: 'Number', value: 1 },
          timestamp: {
            type: 'DateTime',
            value: '2024-12-19T09:00:00.000Z',
          },
          nickname: { type: 'Text', value: 'nickname' },
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
          age: { type: 'Text', value: '20代' },
          address: {
            type: 'Text',
            value: '東京都文京区',
          },
          memo: { type: 'Text', value: 'ダミーメモ' },
        },
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
            'Content-Type': 'application/json',
          },
        },
      );
      expect(result).toEqual(expectedHappinessInputResponse);
    });
  });
});
