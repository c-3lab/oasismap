import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ChangeHistoriesController } from './change-histories.controller';
import { ChangeHistoriesService } from './change-histories.service';
import { OrionNotificationDto } from './dto/orion-notification.dto';
import { EntitySaveFailedException } from './exceptions/entity-save-failed.exception';

describe('ChangeHistoriesController', () => {
  let controller: ChangeHistoriesController;
  let changeHistoriesService: { processNotification: jest.Mock };
  let errorSpy: jest.SpyInstance;

  const validBody: OrionNotificationDto = {
    subscriptionId: 'sub-001',
    data: [],
  };

  beforeEach(async () => {
    changeHistoriesService = {
      processNotification: jest.fn().mockResolvedValue(undefined),
    };

    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChangeHistoriesController],
      providers: [
        {
          provide: ChangeHistoriesService,
          useValue: changeHistoriesService,
        },
      ],
    }).compile();

    controller = module.get<ChangeHistoriesController>(
      ChangeHistoriesController,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('notify', () => {
    it('should process notification and return success with valid headers', async () => {
      const result = await controller.notify(
        validBody,
        'government',
        '/happiness',
      );

      expect(changeHistoriesService.processNotification).toHaveBeenCalledTimes(
        1,
      );
      expect(changeHistoriesService.processNotification).toHaveBeenCalledWith(
        validBody,
        '/happiness',
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw when Fiware-Service header is missing', async () => {
      const promise = controller.notify(validBody, undefined, '/happiness');

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(
        'Fiware-Service header is required',
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Fiware-Service header is required',
      );
      expect(changeHistoriesService.processNotification).not.toHaveBeenCalled();
    });

    it('should throw when Fiware-Service header is invalid', async () => {
      const promise = controller.notify(
        validBody,
        'invalid-service',
        '/happiness',
      );

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Invalid Fiware-Service');

      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid Fiware-Service. expected=government, actual=invalid-service',
      );
      expect(changeHistoriesService.processNotification).not.toHaveBeenCalled();
    });

    it('should throw when Fiware-ServicePath header is missing', async () => {
      const promise = controller.notify(validBody, 'government', undefined);

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(
        'Fiware-ServicePath header is required',
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Fiware-ServicePath header is required',
      );
      expect(changeHistoriesService.processNotification).not.toHaveBeenCalled();
    });

    it('should throw when Fiware-ServicePath header is invalid', async () => {
      const promise = controller.notify(validBody, 'government', '/wrong');

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Invalid Fiware-ServicePath');

      expect(errorSpy).toHaveBeenCalledWith(
        'Invalid Fiware-ServicePath. expected=/happiness, actual=/wrong',
      );
      expect(changeHistoriesService.processNotification).not.toHaveBeenCalled();
    });

    it('should rethrow EntitySaveFailedException without unexpected error log', async () => {
      const saveError = new Error('save error');
      const exception = new EntitySaveFailedException('test-1', saveError);
      changeHistoriesService.processNotification.mockRejectedValue(exception);

      await expect(
        controller.notify(validBody, 'government', '/happiness'),
      ).rejects.toThrow(exception);

      expect(errorSpy).not.toHaveBeenCalledWith(
        expect.stringContaining(
          'Unexpected error while processing notification',
        ),
      );
    });

    it('should log and rethrow when processNotification fails with an unexpected error', async () => {
      const error = new Error('unexpected');
      changeHistoriesService.processNotification.mockRejectedValue(error);

      await expect(
        controller.notify(validBody, 'government', '/happiness'),
      ).rejects.toThrow(error);

      expect(errorSpy).toHaveBeenCalledWith(
        `Unexpected error while processing notification. error=${String(error)}`,
        error.stack,
      );
    });

    it('should log and rethrow when processNotification fails with a non-Error value', async () => {
      const error = 'unexpected string error';
      changeHistoriesService.processNotification.mockRejectedValue(error);

      await expect(
        controller.notify(validBody, 'government', '/happiness'),
      ).rejects.toBe(error);

      expect(errorSpy).toHaveBeenCalledWith(
        `Unexpected error while processing notification. error=${String(error)}`,
        undefined,
      );
    });
  });
});
