import { afterEach } from 'node:test';
import { ChangeHistoriesService } from './change-histories.service';
import {
  OrionNotificationDto,
  OrionNotificationEntityDto,
} from './dto/orion-notification.dto';
import { Logger } from '@nestjs/common';

describe('ChangeHistoriesService', () => {
  let changeHistoriesService: ChangeHistoriesService;

  let repository: {
    save: jest.Mock;
    find: jest.Mock;
    delete: jest.Mock;
    clear: jest.Mock;
  };

  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    repository = {
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    };

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    changeHistoriesService = new ChangeHistoriesService(repository as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processNotification', () => {
    it('should convert an entity to change history data format', async () => {
      const timestamp = new Date('2024-03-16T05:02:38.150Z');
      const servicepath = '/happiness';
      const mockNotification: OrionNotificationDto = {
        subscriptionId: 'sub-001',
        data: [
          {
            id: 'test-1',
            type: 'happiness',
            address: { type: 'Text', value: '東京都文京区' },
            age: { type: 'Text', value: '20代' },
            nickname: { type: 'Text', value: 'testuser' },
            location: {
              type: 'geo:json',
              value: {
                type: 'Point',
                coordinates: [139.72382, 35.629327],
              },
              metadata: {
                place: {
                  type: 'Text',
                  value: '東京都品川区',
                },
              },
            },
            timestamp: {
              type: 'DateTime',
              value: timestamp.toISOString(),
            },
            memo: {
              type: 'Text',
              value: 'test memo',
            },
            happiness1: { type: 'Number', value: 1 },
            happiness2: { type: 'Number', value: 1 },
            happiness3: { type: 'Number', value: 1 },
            happiness4: { type: 'Number', value: 1 },
            happiness5: { type: 'Number', value: 1 },
            happiness6: { type: 'Number', value: 1 },
          },
        ],
      };

      await changeHistoriesService.processNotification(
        mockNotification,
        servicepath,
      );

      expect(repository.save).toHaveBeenCalledTimes(1);

      const savedData = repository.save.mock.calls[0][0];

      expect(savedData.entityId).toBe('test-1');
      expect(savedData.entityType).toBe('happiness');
      expect(savedData.happiness1).toBe(1);
      expect(savedData.happiness2).toBe(1);
      expect(savedData.happiness3).toBe(1);
      expect(savedData.happiness4).toBe(1);
      expect(savedData.happiness5).toBe(1);
      expect(savedData.happiness6).toBe(1);
      expect(savedData.timestamp).toEqual(timestamp);
      expect(savedData.nickname).toBe('testuser');
      expect(savedData.location).toBe(
        '{"type":"Point","coordinates":[139.72382,35.629327]}',
      );
      expect(savedData.locationMd).toBe(
        '[{"name":"place","type":"Text","value":"東京都品川区"}]',
      );
      expect(savedData.age).toBe('20代');
      expect(savedData.address).toBe('東京都文京区');
      expect(savedData.memo).toBe('test memo');

      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        'Received notification. subscriptionId=sub-001, count=1',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Received entity. entityId=test-1, type=happiness',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        3,
        'Saved entity. entityId=test-1',
      );
    });

    it('should convert metadata for text attributes and handle missing memo and location value', async () => {
      const timestamp = new Date('2024-03-16T05:02:38.150Z');
      const servicepath = '/happiness';
      const mockNotification: OrionNotificationDto = {
        subscriptionId: 'sub-002',
        data: [
          {
            id: 'test-2',
            type: 'happiness',
            address: {
              type: 'Text',
              value: '東京都文京区',
              metadata: {
                source: { type: 'Text', value: 'orion' },
              },
            },
            age: {
              type: 'Text',
              value: '30代',
              metadata: {
                band: { type: 'Text', value: '30-39' },
              },
            },
            nickname: {
              type: 'Text',
              value: 'nick',
              metadata: {
                display: { type: 'Text', value: 'Nick Name' },
              },
            },
            location: {
              type: 'geo:json',
              metadata: {
                place: { type: 'Text', value: '品川区' },
              },
            },
            timestamp: {
              type: 'DateTime',
              value: timestamp.toISOString(),
            },
            happiness1: { type: 'Number', value: 1 },
            happiness2: { type: 'Number', value: 0 },
            happiness3: { type: 'Number', value: 0 },
            happiness4: { type: 'Number', value: 0 },
            happiness5: { type: 'Number', value: 0 },
            happiness6: { type: 'Number', value: 0 },
          } as unknown as OrionNotificationEntityDto,
        ],
      };

      await changeHistoriesService.processNotification(
        mockNotification,
        servicepath,
      );

      const savedData = repository.save.mock.calls[0][0];

      expect(savedData.nicknameMd).toBe(
        '[{"name":"display","type":"Text","value":"Nick Name"}]',
      );
      expect(savedData.ageMd).toBe(
        '[{"name":"band","type":"Text","value":"30-39"}]',
      );
      expect(savedData.addressMd).toBe(
        '[{"name":"source","type":"Text","value":"orion"}]',
      );
      expect(savedData.location).toBe('{}');
      expect(savedData.locationMd).toBe(
        '[{"name":"place","type":"Text","value":"品川区"}]',
      );
      expect(savedData.memo).toBe('');
      expect(savedData.memoMd).toBe('[]');
    });

    it('should convert entities with location data', async () => {
      const timestamp = new Date('2024-03-16T05:02:38.150Z');
      const servicepath = '/happiness';
      const mockNotification: OrionNotificationDto = {
        subscriptionId: 'sub-001',
        data: [
          {
            id: 'test-1',
            type: 'happiness',
            address: { type: 'Text', value: '東京都文京区' },
            age: { type: 'Text', value: '20代' },
            nickname: { type: 'Text', value: 'testuser' },
            location: {
              type: 'geo.json',
              value: { type: 'Point', coordinates: [139.72382, 35.629327] },
            },
            timestamp: {
              type: 'DateTime',
              value: timestamp.toISOString(),
            },
            memo: { type: 'Text', value: '' },
            happiness1: { type: 'Number', value: 1 },
            happiness2: { type: 'Number', value: 1 },
            happiness3: { type: 'Number', value: 1 },
            happiness4: { type: 'Number', value: 1 },
            happiness5: { type: 'Number', value: 1 },
            happiness6: { type: 'Number', value: 1 },
          },
        ],
      };

      await changeHistoriesService.processNotification(
        mockNotification,
        servicepath,
      );

      expect(repository.save).toHaveBeenCalledTimes(1);

      const savedData = repository.save.mock.calls[0][0];

      expect(savedData.entityId).toBe('test-1');
      expect(savedData.entityType).toBe('happiness');
      expect(savedData.happiness1).toBe(1);
      expect(savedData.happiness2).toBe(1);
      expect(savedData.happiness3).toBe(1);
      expect(savedData.happiness4).toBe(1);
      expect(savedData.happiness5).toBe(1);
      expect(savedData.happiness6).toBe(1);
      expect(savedData.timestamp).toEqual(timestamp);
      expect(savedData.nickname).toBe('testuser');
      expect(savedData.location).toBe(
        '{"type":"Point","coordinates":[139.72382,35.629327]}',
      );
      expect(savedData.locationMd).toBe('[]');
      expect(savedData.age).toBe('20代');
      expect(savedData.address).toBe('東京都文京区');
      expect(savedData.memo).toBe('');

      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        'Received notification. subscriptionId=sub-001, count=1',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Received entity. entityId=test-1, type=happiness',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        3,
        'Saved entity. entityId=test-1',
      );
    });

    it('should throw an error when saving change history data fails', async () => {
      repository.save.mockRejectedValue(new Error('save error'));

      const timestamp = new Date('2024-03-16T05:02:38.150Z');
      const servicepath = '/happiness';
      const mockNotification: OrionNotificationDto = {
        subscriptionId: 'sub-001',
        data: [
          {
            id: 'test-1',
            type: 'happiness',
            address: { type: 'Text', value: '東京都文京区' },
            age: { type: 'Text', value: '20代' },
            nickname: { type: 'Text', value: 'testuser' },
            location: {
              type: 'geo:json',
              value: {
                type: 'Point',
                coordinates: [139.72382, 35.629327],
              },
              metadata: {
                place: {
                  type: 'Text',
                  value: '東京都品川区',
                },
              },
            },
            timestamp: {
              type: 'DateTime',
              value: timestamp.toISOString(),
            },
            memo: {
              type: 'Text',
              value: 'test memo',
            },
            happiness1: { type: 'Number', value: 1 },
            happiness2: { type: 'Number', value: 1 },
            happiness3: { type: 'Number', value: 1 },
            happiness4: { type: 'Number', value: 1 },
            happiness5: { type: 'Number', value: 1 },
            happiness6: { type: 'Number', value: 1 },
          },
        ],
      };

      const error = new Error('save error');

      await expect(
        changeHistoriesService.processNotification(
          mockNotification,
          servicepath,
        ),
      ).rejects.toMatchObject({ entityId: 'test-1', cause: error });

      expect(logSpy).toHaveBeenNthCalledWith(
        1,
        'Received notification. subscriptionId=sub-001, count=1',
      );
      expect(logSpy).toHaveBeenNthCalledWith(
        2,
        'Received entity. entityId=test-1, type=happiness',
      );
      expect(errorSpy).toHaveBeenNthCalledWith(
        1,
        `Failed to save entity. entityId=test-1. error=${String(error)}`,
      );
    });
  });

  describe('find', () => {
    it('should call repository.find with the provided options', async () => {
      await changeHistoriesService.find({
        order: {
          timestamp: 'ASC',
        },
      });

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        order: {
          timestamp: 'ASC',
        },
      });
    });
  });

  describe('delete', () => {
    it('should call repository.delete with the provided id', async () => {
      await changeHistoriesService.delete('1');

      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('clear', () => {
    it('should call repository.clear', async () => {
      await changeHistoriesService.clear();

      expect(repository.clear).toHaveBeenCalledTimes(1);
      expect(repository.clear).toHaveBeenCalledWith();
    });
  });
});
