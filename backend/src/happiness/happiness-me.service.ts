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
    
    // Query database để lấy 1 dữ liệu thật
    const query = `nickname==${userAttribute.nickname}`;
    console.log('Query:', query);
    
    const realEntities = await this.getHappinessEntities(query, limit, offset);
    console.log('Real entities from DB:', realEntities.length);

    // Tạo 1000 pins từ 1 dữ liệu thật
    const baseEntity = realEntities.length > 0 ? realEntities[0] : null;
    const additionalPins = this.generatePinsFromBase(baseEntity, userAttribute, 1000);
    
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
    
    // Tọa độ cơ sở - phân bố rộng hơn cho 100 pins
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0; // ±1.0 degree latitude để phân bố rộng hơn
    const lngRange = 1.0; // ±1.0 degree longitude để phân bố rộng hơn
    
    // Tạo 100 pins, mỗi pin chỉ có 1 happiness key
    for (let i = 0; i < count; i++) {
      // Tạo timestamp ngẫu nhiên trong khoảng thời gian
      const randomTime = startDate.plus({
        seconds: Math.random() * endDate.diff(startDate).as('seconds')
      });
      
      // Đảm bảo timestamp có format đúng
      const formattedTime = randomTime.toISO();
      
      // Tạo tọa độ ngẫu nhiên với phân bố rộng hơn
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Chọn ngẫu nhiên 1 happiness key cho mỗi pin
      const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Tạo entity với chỉ 1 happiness key có giá trị, các key khác = 0
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
      
      // Chỉ set 1 happiness key = 1, các key khác = 0 để tạo đúng 1 pin
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
    
    // Tọa độ cơ sở
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0;
    const lngRange = 1.0;
    
    // Happiness keys
    const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
    
    for (let i = 0; i < count; i++) {
      // Tạo tọa độ ngẫu nhiên
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Chọn ngẫu nhiên 1 happiness key
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Tạo pin trực tiếp theo format response
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
    
    // Tọa độ cơ sở
    const baseLat = 35.6762; // Tokyo latitude
    const baseLng = 139.6503; // Tokyo longitude
    const latRange = 1.0;
    const lngRange = 1.0;
    
    // Happiness keys
    const happinessKeys = ['happiness1', 'happiness2', 'happiness3', 'happiness4', 'happiness5', 'happiness6'];
    
    for (let i = 0; i < count; i++) {
      // Tạo timestamp ngẫu nhiên
      const randomTime = startDate.plus({
        seconds: Math.random() * endDate.diff(startDate).as('seconds')
      });
      const formattedTime = randomTime.setZone('Asia/Tokyo').toISO();
      
      // Tạo tọa độ ngẫu nhiên
      const randomLat = baseLat + (Math.random() - 0.5) * latRange;
      const randomLng = baseLng + (Math.random() - 0.5) * lngRange;
      
      // Chọn ngẫu nhiên 1 happiness key
      const randomKey = happinessKeys[Math.floor(Math.random() * happinessKeys.length)];
      
      // Tạo pin trực tiếp theo format response
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
            // Debug: Kiểm tra timestamp
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
        }).filter(Boolean); // Loại bỏ null values
      });
      
          console.log('Converted data count:', result.length);
    
    // Debug: Kiểm tra response cuối cùng
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
