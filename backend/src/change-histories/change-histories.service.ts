import { Injectable, Logger } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { Happiness } from './happiness.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { OrionNotificationDto } from './dto/orion-notification.dto';
import {
  NgsiMetadataArrayItem,
  NgsiMetadataItem,
} from './interface/change-histories.interface';

@Injectable()
export class ChangeHistoriesService {
  constructor(
    @InjectRepository(Happiness)
    private happinessRepository: Repository<Happiness>,
  ) {}

  private readonly logger = new Logger(ChangeHistoriesService.name);

  async processNotification(
    notification: OrionNotificationDto,
    servicePath: string,
  ) {
    this.logger.log(
      `Received notification. subscriptionId=${notification.subscriptionId}, count=${notification.data.length}`,
    );

    for (const entity of notification.data) {
      this.logger.log(
        `Received entity. entityId=${entity.id}, type=${entity.type}`,
      );

      const record = this.convert(entity, servicePath);

      try {
        await this.happinessRepository.save(record);

        this.logger.log(`Saved entity. entityId=${entity.id}`);
      } catch (error) {
        this.logger.error(
          `Failed to save entity. entityId=${entity.id}. error=${String(error)}`,
        );

        throw error;
      }
    }
  }

  async find(options?: FindManyOptions<Happiness>): Promise<Happiness[]> {
    return this.happinessRepository.find(options);
  }

  async delete(id: string) {
    await this.happinessRepository.delete(id);
  }

  async clear() {
    await this.happinessRepository.clear();
  }

  private convert(entity: any, servicePath: string) {
    return {
      entityId: entity.id,
      entityType: entity.type,
      fiwareServicePath: servicePath,
      recvTime: new Date(),

      happiness1: entity.happiness1?.value,
      happiness1Md: JSON.stringify(
        this.toMetadataArray(entity.happiness1?.metadata),
      ),

      happiness2: entity.happiness2?.value,
      happiness2Md: JSON.stringify(
        this.toMetadataArray(entity.happiness2?.metadata),
      ),

      happiness3: entity.happiness3?.value,
      happiness3Md: JSON.stringify(
        this.toMetadataArray(entity.happiness3?.metadata),
      ),

      happiness4: entity.happiness4?.value,
      happiness4Md: JSON.stringify(
        this.toMetadataArray(entity.happiness4?.metadata),
      ),

      happiness5: entity.happiness5?.value,
      happiness5Md: JSON.stringify(
        this.toMetadataArray(entity.happiness5?.metadata),
      ),

      happiness6: entity.happiness6?.value,
      happiness6Md: JSON.stringify(
        this.toMetadataArray(entity.happiness6?.metadata),
      ),

      timestamp: new Date(entity.timestamp?.value),
      timestampMd: JSON.stringify(
        this.toMetadataArray(entity.timestamp?.metadata),
      ),

      nickname: entity.nickname?.value,
      nicknameMd: JSON.stringify(
        this.toMetadataArray(entity.nickname?.metadata),
      ),

      location: JSON.stringify(entity.location?.value ?? {}),
      locationMd: JSON.stringify(
        this.toMetadataArray(entity.location?.metadata),
      ),

      age: entity.age?.value,
      ageMd: JSON.stringify(this.toMetadataArray(entity.age?.metadata)),

      address: entity.address?.value,
      addressMd: JSON.stringify(this.toMetadataArray(entity.address?.metadata)),

      memo: entity.memo?.value ?? '',
      memoMd: JSON.stringify(this.toMetadataArray(entity.memo?.metadata)),
    };
  }

  private toMetadataArray(metadata?: Record<string, NgsiMetadataArrayItem>) {
    if (!metadata) {
      return [];
    }

    return Object.entries(metadata).map(
      ([name, item]: [string, NgsiMetadataItem]) => ({
        name,
        type: item.type,
        value: item.value,
      }),
    );
  }
}
