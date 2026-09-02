import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ChangeHistoriesController } from './change-histories.controller';
import { ChangeHistoriesService } from './change-histories.service';
import { OrionNotificationDto } from './dto/orion-notification.dto';

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
  });
});
