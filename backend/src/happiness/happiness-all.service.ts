import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { HappinessAllResponse } from './interface/happiness-all.response';
import { Data } from './interface/happiness-me.response'; // Import for individual data
import { DateTime } from 'luxon';

@Injectable()
export class HappinessAllService {
  private readonly tileSize = 256;

  static keys = [
    'happiness1',
    'happiness2',
    'happiness3',
    'happiness4',
    'happiness5',
    'happiness6',
  ];

  async findHappinessAll(
    start: string,
    end: string,
    limit: string,
    offset: string,
  ): Promise<HappinessAllResponse> {
    const startAsUTC = DateTime.fromISO(start).setZone('UTC').toISO();
    const endAsUTC = DateTime.fromISO(end).setZone('UTC').toISO();

    const query = `timestamp>=${startAsUTC};timestamp<=${endAsUTC}`;
    const happinessEntities = await this.getHappinessEntities(
      query,
      limit,
      offset,
    );

    return {
      count: happinessEntities.length,
      data: this.convertEntitiesToData(happinessEntities),
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

  // New method to convert entities to individual data format
  private convertEntitiesToData(entities: HappinessEntity[]): Data[] {
    return entities.flatMap((entity) => {
      return HappinessAllService.keys.map((key) => ({
        id: uuidv4(),
        entityId: entity.id,
        type: key,
        location: {
          type: entity.location.type,
          value: {
            type: entity.location.value.type,
            // Convert from longitude,latitude to latitude,longitude
            coordinates: [
              entity.location.value.coordinates[1],
              entity.location.value.coordinates[0],
            ],
          },
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
      }));
    });
  }
}
