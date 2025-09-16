import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import {
  HappinessAllResponse,
  MapData,
  MapDataItem,
} from './interface/happiness-all.response';
import { Data } from './interface/happiness-me.response'; // Import for individual data
import { DateTime, DurationLikeObject } from 'luxon';

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
    offset: string
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

  // タイル座標毎にエンティティを整理
  private generateGridEntities(
    zoomLevel: number,
    happinessEntities: HappinessEntity[],
  ): {
    gridKey: string;
    happinessEntities: HappinessEntity[];
  }[] {
    const mapSize = this.tileSize * Math.pow(2, zoomLevel);

    const result: { [key: string]: HappinessEntity[] } = {};

    happinessEntities.forEach((entity) => {
      const [longitude, latitude] = entity.location.value.coordinates;

      const tilePoint = this.toTilePoint(latitude, longitude, mapSize);
      const center = this.toCenterLatLng(
        tilePoint.tileX,
        tilePoint.tileY,
        mapSize,
      );

      const gridKey = `${center.latitude},${center.longitude}`;

      // データを対応するグリッドに追加
      if (!result[gridKey]) {
        result[gridKey] = [];
      }
      result[gridKey].push(entity);
    });

    // データを整形して返す
    return Object.entries(result).map(([gridKey, happinessEntities]) => ({
      gridKey,
      happinessEntities,
    }));
  }

  // 緯度経度,マップサイズからタイル座標を取得
  private toTilePoint(
    latitude: number,
    longitude: number,
    mapSize: number,
  ): { tileX: number; tileY: number } {
    // 緯度経度をラジアンに変換
    const radLatitude = (latitude * Math.PI) / 180;
    const radLongitude = (longitude * Math.PI) / 180;

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
  ): { latitude: number; longitude: number } {
    // タイルの中央を基準としたピクセル座標を計算
    const centerPixelX = (tileX + 0.5) * this.tileSize;
    const centerPixelY = (tileY + 0.5) * this.tileSize;

    // ラジアン座標を計算
    const radLatitude =
      2 *
        Math.atan(
          Math.exp(((mapSize / 2 - centerPixelY) / mapSize) * 2 * Math.PI),
        ) -
      Math.PI / 2;
    const radLongitude = ((centerPixelX - mapSize / 2) / mapSize) * 2 * Math.PI;

    // ラジアンを緯度経度に変換
    const latitude = (radLatitude * 180) / Math.PI;
    const longitude = (radLongitude * 180) / Math.PI;

    return { latitude, longitude };
  }

  private toHappinessAllMapData(
    gridEntities: {
      gridKey: string;
      happinessEntities: HappinessEntity[];
    }[],
  ): { [key: string]: MapData } {
    const map_data = {};
    gridEntities.forEach((entity) => {
      const response: MapDataItem[] = HappinessAllService.keys.map((key) => {
        return {
          id: uuidv4(),
          type: key,
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [
                Number(entity.gridKey.split(',')[0]),
                Number(entity.gridKey.split(',')[1]),
              ],
            },
          },
          answers: {
            happiness1: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[0],
            ),
            happiness2: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[1],
            ),
            happiness3: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[2],
            ),
            happiness4: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[3],
            ),
            happiness5: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[4],
            ),
            happiness6: this.averageHappiness(
              entity.happinessEntities,
              HappinessAllService.keys[5],
            ),
          },
          memos: entity.happinessEntities.map((entity) => {
            return {
              timestamp: entity.timestamp.value,
              memo: entity.memo.value,
            };
          }),
        };
      });
      map_data[entity.gridKey] = {
        count: entity.happinessEntities.length,
        data: response,
      };
    });
    return map_data;
  }

  private averageHappiness(entities: HappinessEntity[], happinessKey: string) {
    if (entities.length === 0) return 0;

    const sum = entities
      .map((entity) => entity[happinessKey].value)
      .reduce((s, value) => s + value, 0);
    return sum / entities.length;
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
