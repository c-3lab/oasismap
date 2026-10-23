import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { OrionNotificationDto } from './orion-notification.dto';

const buildValidPayload = () => {
  const timestamp = '2024-03-16T05:02:38.150Z';

  return {
    subscriptionId: 'sub-001',
    data: [
      {
        id: 'test-1',
        type: 'happiness',
        happiness1: { type: 'Number', value: 1 },
        happiness2: { type: 'Number', value: 1 },
        happiness3: { type: 'Number', value: 1 },
        happiness4: { type: 'Number', value: 1 },
        happiness5: { type: 'Number', value: 1 },
        happiness6: { type: 'Number', value: 1 },
        timestamp: { type: 'DateTime', value: timestamp },
        nickname: { type: 'Text', value: 'testuser' },
        age: { type: 'Text', value: '20代' },
        address: { type: 'Text', value: '東京都文京区' },
        memo: { type: 'Text', value: 'test memo' },
        location: {
          type: 'geo:json',
          value: {
            type: 'Point',
            coordinates: [139.72382, 35.629327],
          },
        },
      },
    ],
  };
};

describe('OrionNotificationDto', () => {
  it('should succeed validation for a complete notification payload', async () => {
    const dto = plainToInstance(OrionNotificationDto, buildValidPayload());
    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail validation when entity type is not happiness', async () => {
    const payload = buildValidPayload();
    payload.data[0].type = 'other';

    const dto = plainToInstance(OrionNotificationDto, payload);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const dataErrors = errors.find((e) => e.property === 'data');
    expect(
      dataErrors?.children?.[0]?.children?.some((c) => c.property === 'type'),
    ).toBe(true);
  });

  it('should fail validation when subscriptionId is empty', async () => {
    const payload = { ...buildValidPayload(), subscriptionId: '' };

    const dto = plainToInstance(OrionNotificationDto, payload);
    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('subscriptionId');
  });
});
