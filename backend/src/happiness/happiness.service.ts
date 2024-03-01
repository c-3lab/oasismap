import axios from 'axios';
import { HappinessEntities } from './interface/happiness-entities';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { v4 as uuidv4 } from 'uuid';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  GraphData,
  HappinessAllResponse,
  MapData,
} from './interface/happiness-all.response';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { UserAttribute } from 'src/auth/interface/user-attribute';
import { HappinessResponse } from './interface/happiness.response';

@Injectable()
export class HappinessService {
  private readonly tileSize = 256;

  static keys = [
    'happiness1',
    'happiness2',
    'happiness3',
    'happiness4',
    'happiness5',
    'happiness6',
  ];

  async postHappiness(
    userAttribute: UserAttribute,
    body: CreateHappinessDto,
  ): Promise<HappinessResponse> {
    const id = uuidv4();
    const entities = this.createEntities(userAttribute, body, id);
    await this.postHappinessEntitiy(entities);

    const happinessResponse: HappinessResponse = {
      message: 'Happiness has been sent.',
      entity_id: id,
    };

    return happinessResponse;
  }

  async findHapinessMe(
    nickname: string,
    start: string,
    end: string,
  ): Promise<HappinessMeResponse[]> {
    const query = `nickname==${nickname};timestamp>=${start};timestamp<=${end}`;
    const happinessEntities = await this.getHappinessEntities(query);
    return this.toHappinessMeResponse(happinessEntities);
  }

  async findHapinessAll(
    start: string,
    end: string,
    period: 'time' | 'date' | 'month',
    zoomLevel: number,
  ): Promise<HappinessAllResponse> {
    const query = `timestamp>=${start};timestamp<=${end}`;
    const happinessEntities = await this.getHappinessEntities(query);
    const gridEntities = this.generateGridEntities(
      zoomLevel,
      happinessEntities,
    );

    return {
      map_data: this.toHappinessAllMapData(gridEntities),
      graph_data: this.calculateGraphData(
        happinessEntities,
        start,
        end,
        period,
      ),
    };
  }

  private createEntities(
    userAttribute: UserAttribute,
    body: CreateHappinessDto,
    id: string,
  ): HappinessEntities {
    const formattedData: HappinessEntities = {
      id: id,
      type: 'happiness',
      happiness1: {
        type: 'Number',
        value: body.happiness.happiness1,
      },
      happiness2: {
        type: 'Number',
        value: body.happiness.happiness2,
      },
      happiness3: {
        type: 'Number',
        value: body.happiness.happiness3,
      },
      happiness4: {
        type: 'Number',
        value: body.happiness.happiness4,
      },
      happiness5: {
        type: 'Number',
        value: body.happiness.happiness5,
      },
      happiness6: {
        type: 'Number',
        value: body.happiness.happiness6,
      },
      timestamp: {
        type: 'DateTime',
        value: new Date().toISOString(),
      },
      nickname: {
        type: 'Text',
        value: userAttribute.nickname,
      },
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [body.longitude, body.latitude],
        },
        metadata: {
          place: {
            type: 'Text',
            value: '東京都渋谷区',
          },
        },
      },
      age: {
        type: 'Text',
        value: userAttribute.age,
      },
      address: {
        type: 'Text',
        value: userAttribute.address,
      },
    };

    return formattedData;
  }

  private async postHappinessEntitiy(entities: HappinessEntities) {
    axios
      .post(`${process.env.ORION_URI}/v2/entities`, entities, {
        headers: {
          'Fiware-Service': `${process.env.ORION_FIWARE_SERVICE}`,
          'Fiware-ServicePath': `${process.env.ORION_FIWARE_SERVICE_PATH}`,
          'Content-Type': 'application/json',
        },
      })
      .then(function (response) {
        if (response.status != HttpStatus.CREATED) {
          throw new InternalServerErrorException();
        }
      })
      .catch(function (error) {
        throw new InternalServerErrorException(error);
      });
  }

  private async getHappinessEntities(
    query: string,
  ): Promise<HappinessEntities[]> {
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
    entities: HappinessEntities[],
  ): HappinessMeResponse[] {
    return entities.flatMap((entity) => {
      return HappinessService.keys.map((key) => ({
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

  // タイル座標毎にエンティティを整理
  private generateGridEntities(
    zoomLevel: number,
    happinessEntities: HappinessEntities[],
  ): { lat: number; lng: number; happiness: HappinessEntities[] }[] {
    const mapSize = this.tileSize * Math.pow(2, zoomLevel);

    const result = happinessEntities.reduce((gridMap, entity) => {
      const coordinates = entity.location.value.coordinates;
      const longitude = coordinates[0];
      const latitude = coordinates[1];

      const tileCoordinates = this.toTilePoint(latitude, longitude, mapSize);
      const centerLatLng = this.toCenterLatLng(
        tileCoordinates.tileX,
        tileCoordinates.tileY,
        mapSize,
      );

      const gridKey = `${centerLatLng.centerLat},${centerLatLng.centerLng}`;

      // データを対応するグリッドに追加
      gridMap.set(gridKey, [...(gridMap.get(gridKey) || []), entity]);

      return gridMap;
    }, new Map<string, HappinessEntities[]>());

    // データを整形して返す
    return Array.from(result.entries()).map(([location, happiness]) => ({
      lat: Number(location.split(',')[0]),
      lng: Number(location.split(',')[1]),
      happiness,
    }));
  }

  // 緯度経度,マップサイズから世界座標を取得
  private toTilePoint(
    lat: number,
    lng: number,
    mapSize: number,
  ): { tileX: number; tileY: number } {
    // 緯度経度をラジアンに変換
    const radLatitude = (lat * Math.PI) / 180;
    const radLongitude = (lng * Math.PI) / 180;

    // ピクセル座標を計算
    const pixelX = ((radLongitude + Math.PI) / (2 * Math.PI)) * mapSize;
    const pixelY =
      ((Math.PI - Math.log(Math.tan(Math.PI / 4 + radLatitude / 2))) /
        (2 * Math.PI)) *
      mapSize;

    // タイル座標を計算
    const tileX = Math.floor(pixelX / this.tileSize);
    const tileY = Math.floor(pixelY / this.tileSize);

    return { tileX, tileY };
  }

  // タイル座標からタイルの中心緯度経度を取得
  private toCenterLatLng(
    tileX: number,
    tileY: number,
    mapSize: number,
  ): { centerLat: number; centerLng: number } {
    // タイルの中心座標を計算
    const tileCenterX = (tileX + 0.5) * this.tileSize;
    const tileCenterY = (tileY + 0.5) * this.tileSize;

    // ピクセル座標を中心に戻す
    const centerPixelX = tileCenterX - mapSize / 2;
    const centerPixelY = mapSize / 2 - tileCenterY;

    // 中心の緯度経度を計算
    const centerLat =
      ((2 * Math.atan(Math.exp((centerPixelY / mapSize) * 2 * Math.PI)) -
        Math.PI / 2) *
        180) /
      Math.PI;
    const centerLng = (centerPixelX / mapSize) * 360;

    return { centerLat, centerLng };
  }

  private toHappinessAllMapData(
    gridEntities: {
      lat: number;
      lng: number;
      happiness: HappinessEntities[];
    }[],
  ): MapData[] {
    return gridEntities.flatMap((entity) => {
      return HappinessService.keys.map((key) => {
        const averageHappiness = (happinessKey: string) =>
          entity.happiness
            .map((h) => h[happinessKey].value)
            .reduce((sum, value) => sum + value / entity.happiness.length, 0);

        const response: MapData = {
          id: uuidv4(),
          type: key,
          location: {
            type: entity.happiness[0].location.type,
            value: {
              type: entity.happiness[0].location.value.type,
              coordinates: [entity.lat, entity.lng],
            },
          },
          answers: {
            happiness1: averageHappiness(HappinessService.keys[0]),
            happiness2: averageHappiness(HappinessService.keys[1]),
            happiness3: averageHappiness(HappinessService.keys[2]),
            happiness4: averageHappiness(HappinessService.keys[3]),
            happiness5: averageHappiness(HappinessService.keys[4]),
            happiness6: averageHappiness(HappinessService.keys[5]),
          },
        };

        return response;
      });
    });
  }

  private calculateGraphData(
    entities: HappinessEntities[],
    start: string,
    end: string,
    period: 'time' | 'date' | 'month',
  ): GraphData[] {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const result: GraphData[] = [];

    while (startDate <= endDate) {
      const timestamp = startDate.toISOString();

      const filteredData = entities.filter((entity) => {
        const entityTimestamp = new Date(entity.timestamp.value).toISOString();
        return entityTimestamp.startsWith(
          timestamp.slice(
            0,
            period === 'time' ? 13 : period === 'date' ? 10 : 7,
          ),
        );
      });

      const averageHappiness = (happinessKey: string) => {
        const sum = filteredData.reduce(
          (acc, entity) => acc + entity[happinessKey].value,
          0,
        );
        return filteredData.length > 0 ? sum / filteredData.length : 0;
      };

      const graphData: GraphData = {
        timestamp,
        happiness1: averageHappiness('happiness1'),
        happiness2: averageHappiness('happiness2'),
        happiness3: averageHappiness('happiness3'),
        happiness4: averageHappiness('happiness4'),
        happiness5: averageHappiness('happiness5'),
        happiness6: averageHappiness('happiness6'),
      };

      result.push(graphData);

      if (period === 'time') {
        startDate.setHours(startDate.getHours() + 1);
      } else if (period === 'date') {
        startDate.setDate(startDate.getDate() + 1);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() + 1);
      }
    }

    return result;
  }
}
