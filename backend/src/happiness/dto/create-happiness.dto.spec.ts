import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateHappinessDto } from './create-happiness.dto';

describe('CreateHappinessDto', () => {
  it('should succeed in validation when not all happiness values are zero', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
      timestamp: '2024-12-19T09:00:00.000Z',
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(0);
  });

  it('should succeed in validation when not all happiness values are zero and not timestamp', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when invalid timestamp', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
      timestamp: '2024/12/19T09:00:00.000Z',
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isIso8601: 'timestamp must be a valid ISO 8601 date string',
    });
  });

  it('should fail validation when all happiness values are zero', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ',
      answers: {
        happiness1: 0,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isNotAllHappinessZero: 'All happiness values cannot be zero.',
      isExactlyOneHappinessSelected:
        'Exactly one happiness value must be selected (value = 1).',
    });
  });

  it('should fail validation when memo has orion forbidden chars', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ<',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isNotOrionForbiddenChar: 'memo must not contain <, >, ", \', =, ;, (, ).',
    });
  });

  it('should fail validation when memo has surrogate pair', async () => {
    const requestParam: CreateHappinessDto = {
      latitude: 35.629327,
      longitude: 139.72382,
      memo: 'ダミーメモ😁',
      answers: {
        happiness1: 1,
        happiness2: 0,
        happiness3: 0,
        happiness4: 0,
        happiness5: 0,
        happiness6: 0,
      },
    };
    const CreateHappinessObject = plainToInstance(
      CreateHappinessDto,
      requestParam,
    );
    const errors = await validate(CreateHappinessObject);

    expect(errors.length).toBe(1);
    expect(errors[0].constraints).toEqual({
      isNotSurrogatePair: 'memo must not be a surrogate pair.',
    });
  });
});
