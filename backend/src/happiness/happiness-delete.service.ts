import axios from 'axios';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HappinessResponse } from './interface/happiness.response';
import { InjectRepository } from '@nestjs/typeorm';
import { Happiness } from './happiness.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HappinessDeleteService {
  constructor(
    @InjectRepository(Happiness)
    private happinessRepository: Repository<Happiness>,
  ) {}

  async deleteHappiness(id: string): Promise<HappinessResponse> {
    await this.deleteHappinessEntity(id);
    await this.happinessRepository.delete(id);

    const happinessResponse: HappinessResponse = {
      message: 'Happiness has been deleted.',
      entity_id: id,
    };

    return happinessResponse;
  }

  private async deleteHappinessEntity(id: string) {
    try {
      await axios.delete(`${process.env.ORION_URI}/v2/entities/${id}`, {
        headers: {
          'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
          'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
        },
      });
    } catch (error) {
      // orionは識別されるリソースが見つからない場合、NotFound (404) が返される
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        throw new BadRequestException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
