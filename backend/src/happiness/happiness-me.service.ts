import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HappinessMeService {
  static keys = [
    'happiness1',
    'happiness2',
    'happiness3',
    'happiness4',
    'happiness5',
    'happiness6',
  ];

  async findHapinessMe(
    authorization: string,
    start: string,
    end: string,
  ): Promise<HappinessMeResponse[]> {
    const query = `nickname==${this.getNicknameFromToken(
      authorization,
    )};timestamp>=${start};timestamp<=${end}`;
    const happinessEntities = await this.getHappinessEntities(query);

    return this.toHappinessMeResponse(happinessEntities);
  }

  // TODO: authorizationからニックネームを取得する
  private getNicknameFromToken(authorization: string): string {
    console.log(authorization);
    return 'nickname';
  }

  private async getHappinessEntities(
    query: string,
  ): Promise<HappinessEntity[]> {
    const response = await axios.get(`${process.env.ORION_URI}/v2/entities`, {
      headers: {
        'Fiware-Service': `${process.env.ORION_FIWARE_SERVICE}`,
        'Fiware-ServicePath': `${process.env.ORION_FIWARE_SERVICE_PATH}`,
      },
      params: {
        q: query,
      },
    });
    return response.data;
  }

  private toHappinessMeResponse(
    entities: HappinessEntity[],
  ): HappinessMeResponse[] {
    return entities.flatMap((entity) => {
      return HappinessMeService.keys.map((key) => ({
        id: uuidv4(),
        type: key,
        location: {
          type: entity.location.type,
          value: {
            type: entity.location.value.type,
            // orionは経度緯度の順なので緯度経度に整形
            coordinates: [
              entity.location.value.coordinates[1],
              entity.location.value.coordinates[0],
            ],
          },
        },
        timestamp: {
          type: entity.timestamp.type,
          value: entity.timestamp.value,
        },
        answers: {
          happiness1: entity.happiness1.value,
          happiness2: entity.happiness2.value,
          happiness3: entity.happiness3.value,
          happiness4: entity.happiness4.value,
          happiness5: entity.happiness5.value,
          happiness6: entity.happiness6.value,
        },
      }));
    });
  }
}
