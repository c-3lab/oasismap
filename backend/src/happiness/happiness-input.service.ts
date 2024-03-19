import axios from 'axios';
import { HappinessEntity } from './interface/happiness-entity';
import { v4 as uuidv4 } from 'uuid';
import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateHappinessDto } from './dto/create-happiness.dto';
import { UserAttribute } from 'src/auth/interface/user-attribute';
import { HappinessResponse } from './interface/happiness.response';

@Injectable()
export class HappinessInputService {
  async postHappiness(
    userAttribute: UserAttribute,
    body: CreateHappinessDto,
  ): Promise<HappinessResponse> {
    const id = uuidv4();
    const entity = this.toPostEntity(userAttribute, body, id);
    await this.postHappinessEntity(entity);

    const happinessResponse: HappinessResponse = {
      message: 'Happiness has been sent.',
      entity_id: id,
    };

    return happinessResponse;
  }

  private toPostEntity(
    userAttribute: UserAttribute,
    body: CreateHappinessDto,
    id: string,
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
            // TODO:リバースジオコーディングから取得
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

  private async postHappinessEntity(entity: HappinessEntity) {
    const response = await axios.post(
      `${process.env.ORION_URI}/v2/entities`,
      entity,
      {
        headers: {
          'Fiware-Service': `${process.env.ORION_FIWARE_SERVICE}`,
          'Fiware-ServicePath': `${process.env.ORION_FIWARE_SERVICE_PATH}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.status !== HttpStatus.CREATED) {
      throw new InternalServerErrorException();
    }
  }
}
