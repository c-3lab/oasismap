import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import {
  HappinessListResponse,
  Data,
} from './interface/happiness-list.response';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { UserAttribute } from 'src/auth/interface/user-attribute';

@Injectable()
export class HappinessListService {
  async findHappinessList(
    userAttribute: UserAttribute,
    limit: string,
    offset: string,
  ): Promise<HappinessListResponse> {
    const query = `nickname==${userAttribute.nickname}`;
    const happinessEntities = await this.getHappinessEntities(
      query,
      limit,
      offset,
    );

    return {
      count: happinessEntities.length,
      data: this.toHappinessListResponse(happinessEntities),
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

  private toHappinessListResponse(entities: HappinessEntity[]): Data[] {
    return entities.flatMap((entity) => {
      return {
        id: entity.id,
        location: {
          value: {
            // orionは経度緯度の順なので緯度経度に整形
            coordinates: [
              entity.location.value.coordinates[1],
              entity.location.value.coordinates[0],
            ],
          },
          place: entity.location.metadata.place.value,
        },
        timestamp: DateTime.fromISO(entity.timestamp.value)
          .setZone('Asia/Tokyo')
          .toISO(),
        memo: entity.memo?.value ?? '',
        answers: {
          happiness1: entity.happiness1.value,
          happiness2: entity.happiness2.value,
          happiness3: entity.happiness3.value,
          happiness4: entity.happiness4.value,
          happiness5: entity.happiness5.value,
          happiness6: entity.happiness6.value,
        },
      };
    });
  }
}
