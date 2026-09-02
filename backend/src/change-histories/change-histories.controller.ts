import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Post,
} from '@nestjs/common';
import { ChangeHistoriesService } from './change-histories.service';
import { OrionNotificationDto } from './dto/orion-notification.dto';
import {
  EXPECTED_FIWARE_SERVICE,
  EXPECTED_SERVICE_PATH,
} from './change-histories.constants';

@Controller('/change-histories/notify')
export class ChangeHistoriesController {
  constructor(
    private readonly changeHistoriesService: ChangeHistoriesService,
  ) {}

  @Post()
  async notify(
    @Body() body: OrionNotificationDto,
    @Headers('fiware-service') service?: string,
    @Headers('fiware-servicepath') servicePath?: string,
  ) {
    if (!service) {
      throw new BadRequestException('Fiware-Service header is required');
    }
    if (service.toLowerCase() !== EXPECTED_FIWARE_SERVICE) {
      throw new BadRequestException('Invalid Fiware-Service');
    }

    if (!servicePath) {
      throw new BadRequestException('Fiware-ServicePath header is required');
    }

    if (servicePath.toLowerCase() !== EXPECTED_SERVICE_PATH) {
      throw new BadRequestException('Invalid Fiware-ServicePath');
    }

    await this.changeHistoriesService.processNotification(body, servicePath);

    return { success: true };
  }
}
