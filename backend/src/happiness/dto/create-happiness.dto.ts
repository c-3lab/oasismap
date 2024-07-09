import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNotAllHappinessZero } from '../validation/is-not-all-happiness-zero';

class Answer {
  @IsNotEmpty()
  happiness1: number;

  @IsNotEmpty()
  happiness2: number;

  @IsNotEmpty()
  happiness3: number;

  @IsNotEmpty()
  happiness4: number;

  @IsNotEmpty()
  happiness5: number;

  @IsNotEmpty()
  happiness6: number;
}

export class CreateHappinessDto {
  readonly latitude: number;
  readonly longitude: number;
  readonly memo: string;

  @ValidateNested()
  @Type(() => Answer)
  @IsNotAllHappinessZero()
  readonly answers: Answer;
}
