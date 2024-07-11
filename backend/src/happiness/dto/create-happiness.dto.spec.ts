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
        happiness3: 1,
        happiness4: 1,
        happiness5: 1,
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
    });
  });
});
