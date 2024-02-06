import axios from 'axios';
import { HappinessEntities } from './interface/hapiness-entities';
import { HappinessMeResponse } from './interface/hapiness-me.response';
import { v4 as uuidv4 } from 'uuid';

export class HapinessService {
  async findHapinessMe(
    authorization: string,
    start: string,
    end: string,
  ): Promise<HappinessMeResponse[]> {
    const nickname = this.certification(authorization);
    const happinessEntities = await this.getHappinessEntities(
      nickname,
      start,
      end,
    );
    return this.convertToHappinessResponse(happinessEntities);
  }

  // TODO:認証 authorizationからニックネームを取得する
  private certification(authorization: string): string {
    console.log(authorization);
    return 'ニックネーム';
  }

  private async getHappinessEntities(
    nickname: string,
    start: string,
    end: string,
  ): Promise<HappinessEntities[]> {
    try {
      const headers = {
        'Fiware-Service': `${process.env.ORION_FIWARE_SERVICE}`,
        'Fiware-ServicePath': `${process.env.ORION_FIWARE_SERVISE_PATH}`,
      };

      const params = {
        q: `nickname==${nickname};time>=${start};time<=${end}`,
      };

      const orionApiResponse = await axios.get(
        `${process.env.ORION_URI}/v2/entities`,
        {
          params,
          headers,
        },
      );
      return orionApiResponse.data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private convertToHappinessResponse(
    originalData: HappinessEntities[],
  ): HappinessMeResponse[] {
    for (const item of originalData) {
      const keys = [
        'happiness1',
        'happiness2',
        'happiness3',
        'happiness4',
        'happiness5',
        'happiness6',
      ];
      return keys.map((key) => {
        const response: HappinessMeResponse = {
          id: uuidv4(),
          type: key,
          location: item.location,
          time: item.time,
          answer: {
            happiness1: item.happiness1.value,
            happiness2: item.happiness2.value,
            happiness3: item.happiness3.value,
            happiness4: item.happiness4.value,
            happiness5: item.happiness5.value,
            happiness6: item.happiness6.value,
          },
        };

        return response;
      });
    }
  }
}
