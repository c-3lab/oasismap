import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  HttpException,
  Post,
  Logger,
  UseFilters,
} from '@nestjs/common';
import { ChangeHistoriesService } from './change-histories.service';
import { OrionNotificationDto } from './dto/orion-notification.dto';
import {
  EXPECTED_FIWARE_SERVICE,
  EXPECTED_SERVICE_PATH,
} from './change-histories.constants';
import { ValidationExceptionFilter } from './filters/validation-exception.filter';
import { EntitySaveFailedException } from './exceptions/entity-save-failed.exception';

@Controller('/change-histories/notify')
@UseFilters(ValidationExceptionFilter)
export class ChangeHistoriesController {
  constructor(
    private readonly changeHistoriesService: ChangeHistoriesService,
  ) {}

  private readonly logger = new Logger(ChangeHistoriesController.name);

  @Post()
  async notify(
    @Body() body: OrionNotificationDto,
    @Headers('fiware-service') service?: string,
    @Headers('fiware-servicepath') servicePath?: string,
  ) {
    try {
      if (!service) {
        this.logger.error('Fiware-Service header is required');

        throw new BadRequestException('Fiware-Service header is required');
      }
      if (service.toLowerCase() !== EXPECTED_FIWARE_SERVICE) {
        this.logger.error(
          `Invalid Fiware-Service. expected=${EXPECTED_FIWARE_SERVICE}, actual=${service}`,
        );

        throw new BadRequestException('Invalid Fiware-Service');
      }

      if (!servicePath) {
        this.logger.error('Fiware-ServicePath header is required');

        throw new BadRequestException('Fiware-ServicePath header is required');
      }

      if (servicePath.toLowerCase() !== EXPECTED_SERVICE_PATH) {
        this.logger.error(
          `Invalid Fiware-ServicePath. expected=${EXPECTED_SERVICE_PATH}, actual=${servicePath}`,
        );
        throw new BadRequestException('Invalid Fiware-ServicePath');
      }

      await this.changeHistoriesService.processNotification(body, servicePath);

      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      if (error instanceof EntitySaveFailedException) {
        throw error;
      }

      this.logger.error(
        `Unexpected error while processing notification. error=${String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }
}
