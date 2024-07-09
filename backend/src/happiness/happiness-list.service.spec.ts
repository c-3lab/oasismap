import { Test, TestingModule } from '@nestjs/testing';
import { HappinessListService } from './happiness-list.service';
import { mockHappinessListEntities } from './mocks/orion/mock-happiness-orion.response';
import { expectedHappinessListResponse } from './expects/happiness/expected-happiness-list.response';
import axios from 'axios';
import { UserAttribute } from 'src/auth/interface/user-attribute';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HappinessListService', () => {
  let happinessListService: HappinessListService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HappinessListService],
    }).compile();

    happinessListService =
      module.get<HappinessListService>(HappinessListService);
  });

  describe('findHappinessList', () => {
    it('should return happiness entities', async () => {
      const spy = mockedAxios.get.mockResolvedValue(mockHappinessListEntities);

      const requestUserAttributes: UserAttribute = {
        nickname: 'nickname',
        age: '20代',
        prefecture: '東京都',
        city: '文京区',
      };
      const limit = '100';
      const offset = '200';
      const result = await happinessListService.findHappinessList(
        requestUserAttributes,
        limit,
        offset,
      );

      expect(spy).toHaveBeenCalledWith(`${process.env.ORION_URI}/v2/entities`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
        params: {
          q: 'nickname==nickname',
          limit: '100',
          offset: '200',
          orderBy: '!timestamp',
        },
      });
      expect(result).toEqual(expectedHappinessListResponse);
    });
  });
});
