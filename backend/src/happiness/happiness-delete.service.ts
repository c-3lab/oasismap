import axios from 'axios';
import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HappinessResponse } from './interface/happiness.response';
import { ChangeHistoriesService } from 'src/change-histories/change-histories.service';
import { UserAttribute } from 'src/auth/interface/user-attribute';

@Injectable()
export class HappinessDeleteService {
  constructor(
    private readonly changeHistoriesService: ChangeHistoriesService,
  ) {}

  async deleteHappiness(
    userAttribute: UserAttribute,
    id: string,
  ): Promise<HappinessResponse> {
    // 投稿者本人以外は削除できない。所有者は投稿時に保存した nickname で判定する
    const owner = await this.getHappinessOwner(id);
    if (!userAttribute.nickname || owner !== userAttribute.nickname) {
      throw new ForbiddenException('You are not the owner of this happiness');
    }

    await this.deleteHappinessEntity(id);
    await this.changeHistoriesService.delete(id);

    const happinessResponse: HappinessResponse = {
      message: 'Happiness has been deleted.',
      entity_id: id,
    };

    return happinessResponse;
  }

  private async getHappinessOwner(id: string): Promise<string | undefined> {
    try {
      const response = await axios.get<{ nickname?: string }>(
        `${process.env.ORION_URI}/v2/entities/${encodeURIComponent(id)}`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
          params: {
            attrs: 'nickname',
            options: 'keyValues',
          },
        },
      );
      return response.data.nickname;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async deleteHappinessEntity(id: string) {
    try {
      await axios.delete(
        `${process.env.ORION_URI}/v2/entities/${encodeURIComponent(id)}`,
        {
          headers: {
            'Fiware-Service': process.env.ORION_FIWARE_SERVICE,
            'Fiware-ServicePath': process.env.ORION_FIWARE_SERVICE_PATH,
          },
        },
      );
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toHttpException(error: unknown) {
    // orionは識別されるリソースが見つからない場合、NotFound (404) が返される
    const status = (error as { response?: { status?: number } } | undefined)
      ?.response?.status;
    if (status === HttpStatus.NOT_FOUND) {
      return new BadRequestException();
    }
    return new InternalServerErrorException(undefined, { cause: error });
  }
}
