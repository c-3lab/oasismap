import axios from 'axios';
import { HappinessEntities } from './interface/happiness-entities';
import { HappinessMeResponse } from './interface/happiness-me.response';
import { v4 as uuidv4 } from 'uuid';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { UserAttribute } from 'src/auth/interface/user-attribute';
import { HappinessResponse } from './interface/happiness.response';
import { DateTime } from 'luxon';
import { Address } from './interface/address';

@Injectable()
export class HappinessService {
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
    const address = await this.getAddress(
      body.latitude.toString(),
      body.longitude.toString(),
    );
    const entities = this.createEntities(id, body, userAttribute, address);
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
    const query = `nickname==${nickname};timestamp>=${new Date(start).toISOString()};timestamp<=${new Date(end).toISOString()}`;
    const happinessEntities = await this.getHappinessEntities(query);
    return this.toHappinessMeResponse(happinessEntities);
  }

  private createEntities(
    id: string,
    body: CreateHappinessDto,
    userAttribute: UserAttribute,
    address: Address,
  ): HappinessEntities {
    const formattedData: HappinessEntities = {
      id: id,
      type: 'happiness',
      happiness1: {
        type: 'Number',
        value: body.answers.happiness1,
      },
      happiness2: {
        type: 'Number',
        value: body.answers.happiness2,
      },
      happiness3: {
        type: 'Number',
        value: body.answers.happiness3,
      },
      happiness4: {
        type: 'Number',
        value: body.answers.happiness4,
      },
      happiness5: {
        type: 'Number',
        value: body.answers.happiness5,
      },
      happiness6: {
        type: 'Number',
        value: body.answers.happiness6,
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
            value: address.level4 + address.level7,
          },
        },
      },
      age: {
        type: 'Text',
        value: userAttribute.age,
      },
      address: {
        type: 'Text',
        value: userAttribute.prefecture + userAttribute.city,
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

  private async getAddress(
    latitude: string,
    longitude: string,
  ): Promise<Address> {
    const response = await axios.get(process.env.REVERSE_GEOCODING_URI, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'geocodejson',
        zoom: 10,
      },
    });
    return response.data.features[0].properties.geocoding.admin;
  }
}
