import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { HappinessMeResponse, Data } from './interface/happiness-me.response';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { UserAttribute } from 'src/auth/interface/user-attribute';

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

  async findHappinessMe(
    userAttribute: UserAttribute,
    start: string,
    end: string,
    limit: string,
    offset: string,
  ): Promise<HappinessMeResponse> {
    const startAsUTC = DateTime.fromISO(start).setZone('UTC').toISO();
    const endAsUTC = DateTime.fromISO(end).setZone('UTC').toISO();
    const query = `nickname==${userAttribute.nickname};timestamp>=${startAsUTC};timestamp<=${endAsUTC}`;
    const happinessEntities = await this.getHappinessEntities(
      query,
      limit,
      offset,
    );

    return {
      count: happinessEntities.length,
      data: this.toHappinessMeResponse(happinessEntities),
    };
  }

  private async getHappinessEntities(
    query: string,
    limit: string,
    offset: string,
  ): Promise<HappinessEntity[]> {
    const response = await axios.get(`${process.env.ORION_URI}/v2/entities`, {
      headers: {
        'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
        'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
      },
      params: {
        q: query,
        limit: limit,
        offset: offset,
        orderBy: '!timestamp',
      },
    });
    return response.data;
  }

  private toHappinessMeResponse(entities: HappinessEntity[]): Data[] {
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
        timestamp: DateTime.fromISO(entity.timestamp.value)
          .setZone('Asia/Tokyo')
          .toISO(),
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
