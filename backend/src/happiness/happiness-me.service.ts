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
    
    // Query database to get real data
    const query = `nickname==${userAttribute.nickname}`;
    console.log('Query:', query);
    
    const realEntities = await this.getHappinessEntities(query, limit, offset);
    console.log('Real entities from DB:', realEntities.length);

    // Generate 1000 pins from real data
    const baseEntity = realEntities.length > 0 ? realEntities[0] : null;
    const additionalPins = this.generatePinsFromBase(baseEntity, userAttribute, 100);
    
    console.log('Generated pins count:', additionalPins.length);
    console.log('First pin:', JSON.stringify(additionalPins[0], null, 2));
    
    return {
      count: additionalPins.length,
      data: additionalPins,
    };
  }

  private generateAdditionalPins(
    userAttribute: UserAttribute,
    startAsUTC: string,
    endAsUTC: string,
    count: number
  ): HappinessEntity[] {
    const entities: HappinessEntity[] = [];
    const startDate = DateTime.fromISO(startAsUTC);
    const endDate = DateTime.fromISO(endAsUTC);
    
    // Base coordinates - wider distribution for 100 pins
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0; // ±1.0 degree latitude for wider distribution
    const lngRange = 1.0; // ±1.0 degree longitude for wider distribution
    
    // Create 100 pins, each pin has only 1 happiness key
    for (let i = 0; i < count; i++) {
      // Generate random timestamp within time range
      const randomTime = startDate.plus({
        seconds: Math.random() * endDate.diff(startDate).as('seconds')
      });
      
      // Ensure timestamp has correct format
      const formattedTime = randomTime.toISO();
      
      // Generate random coordinates with wider distribution
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Randomly select 1 happiness key for each pin
      const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Create entity with only 1 happiness key having value, others = 0
      const entity: any = {
        id: `additional-${Date.now()}-${i}`,
        type: 'happiness',
        timestamp: { type: 'DateTime', value: formattedTime },
        nickname: { type: 'Text', value: userAttribute.nickname },
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [randomLng, randomLat],
          },
          metadata: {
            place: {
              type: 'Text',
              value: `Additional Location ${i}`,
            },
          },
        },
        age: { type: 'Text', value: userAttribute.age },
        address: { type: 'Text', value: userAttribute.prefecture + userAttribute.city },
        memo: { type: 'Text', value: `Additional memo ${i}` },
      };
      
      // Only set 1 happiness key = 1, others = 0 to create exactly 1 pin
      happinessKeys.forEach(key => {
        entity[key] = { type: 'Number', value: key === randomKey ? 1 : 0 };
      });
      
      entities.push(entity);
    }
    
    return entities;
  }

  private generatePinsFromBase(
    baseEntity: HappinessEntity | null,
    userAttribute: UserAttribute,
    count: number
  ): Data[] {
    const pins: Data[] = [];
    
    // Base coordinates
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0;
    const lngRange = 1.0;
    
    // Happiness keys
    const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
    
    for (let i = 0; i < count; i++) {
      // Generate random coordinates
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Randomly select 1 happiness key
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Create pin directly in response format
      pins.push({
        id: `pin-${Date.now()}-${i}`,
        entityId: `entity-${Date.now()}-${i}`,
        type: randomKey,
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [randomLat, randomLng] as [number, number],
          },
        },
        timestamp: new Date().toISOString(),
        memo: `Pin ${i}`,
        answers: {
          happiness1: randomKey === 'happiness1' ? 1 : 0,
          happiness2: randomKey === 'happiness2' ? 1 : 0,
          happiness3: randomKey === 'happiness3' ? 1 : 0,
          happiness4: randomKey === 'happiness4' ? 1 : 0,
          happiness5: randomKey === 'happiness5' ? 1 : 0,
          happiness6: randomKey === 'happiness6' ? 1 : 0,
        },
      });
    }
    
    return pins;
  }

  private generateDirectPins(
    userAttribute: UserAttribute,
    startAsUTC: string,
    endAsUTC: string,
    count: number
  ): Data[] {
    const pins: Data[] = [];
    const startDate = DateTime.fromISO(startAsUTC);
    const endDate = DateTime.fromISO(endAsUTC);
    
    // Base coordinates
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0;
    const lngRange = 1.0;
    
    // Happiness keys
    const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
    
    for (let i = 0; i < count; i++) {
      // Generate random timestamp
      const randomTime = startDate.plus({
        seconds: Math.random() * endDate.diff(startDate).as('seconds')
      });
      const formattedTime = randomTime.setZone('Asia/Tokyo').toISO();
      
      // Generate random coordinates
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Randomly select 1 happiness key
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Create pin directly in response format
      pins.push({
        id: `direct-${Date.now()}-${i}`,
        entityId: `direct-entity-${Date.now()}-${i}`,
        type: randomKey,
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [randomLat, randomLng] as [number, number],
          },
        },
        timestamp: formattedTime,
        memo: `Direct pin ${i}`,
        answers: {
          happiness1: 1,
          happiness2: 1,
          happiness3: 1,
          happiness4: 1,
          happiness5: 1,
          happiness6: 1,
        },
      });
    }
    
    return pins;
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
    console.log(response.data);
    return response.data;
  }

  private toHappinessMeResponse(entities: HappinessEntity[]): Data[] {
    console.log('Converting entities to response format...');
    console.log('Entities count:', entities.length);
    
    try {
      const result = entities.flatMap((entity) => {
        return HappinessMeService.keys.map((key) => {
          try {
            // Debug: Check timestamp
            console.log('Processing entity:', entity.id, 'timestamp:', entity.timestamp.value);
            
            const timestamp = DateTime.fromISO(entity.timestamp.value)
              .setZone('Asia/Tokyo')
              .toISO();
            
            return {
              id: uuidv4(),
              entityId: entity.id,
              type: key,
              location: {
                type: entity.location.type,
                value: {
                  type: entity.location.value.type,
                  // orionは経度緯度の順なので緯度経度に整形
                  coordinates: [
                    entity.location.value.coordinates[1],
                    entity.location.value.coordinates[0],
                  ] as [number, number],
                },
              },
              timestamp: timestamp,
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
          } catch (error) {
            console.error('Error processing entity:', entity.id, error);
            return null;
          }
        }).filter(Boolean); // Remove null values
      });
      
          console.log('Converted data count:', result.length);
    
    // Debug: Check final response
    if (result.length > 0) {
      console.log('First converted data:', JSON.stringify(result[0], null, 2));
    }
    
    return result;
    } catch (error) {
      console.error('Error in toHappinessMeResponse:', error);
      return [];
    }
  }
}
