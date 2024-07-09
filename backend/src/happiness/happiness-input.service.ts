import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { UserAttribute } from 'src/auth/interface/user-attribute';
import { HappinessResponse } from './interface/happiness.response';
import { Address } from './interface/address';

@Injectable()
export class HappinessInputService {
  async postHappiness(
    userAttribute: UserAttribute,
    body: CreateHappinessDto,
  ): Promise<HappinessResponse> {
    const id = uuidv4();
    const address = await this.getAddress(body.latitude, body.longitude);
    const entity = this.toPostEntity(id, body, userAttribute, address);
    await this.postHappinessEntity(entity);

    const happinessResponse: HappinessResponse = {
      message: 'Happiness has been sent.',
      entity_id: id,
    };

    return happinessResponse;
  }

  private toPostEntity(
    id: string,
    body: CreateHappinessDto,
    userAttribute: UserAttribute,
    address: Address,
  ): HappinessEntity {
    const formattedData: HappinessEntity = {
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
      memo: {
        type: 'Text',
        value: body.memo,
      },
    };

    return formattedData;
  }

  private async postHappinessEntity(entity: HappinessEntity) {
    await axios.post(`${process.env.ORION_URI}/v2/entities`, entity, {
      headers: {
        'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
        'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        'Content-Type': 'application/json',
      },
    });
  }

  private async getAddress(
    latitude: number,
    longitude: number,
  ): Promise<Address> {
    const response = await axios.get(process.env.REVERSE_GEOCODING_URL, {
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
