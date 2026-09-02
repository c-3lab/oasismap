import {
  IsArray,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrionNotificationDto {
  @IsString()
  @IsNotEmpty()
  subscriptionId: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrionNotificationEntityDto)
  data: OrionNotificationEntityDto[];
}

export class TimestampAttributeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsISO8601()
  value: string;
}

export class OrionNotificationEntityDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsObject()
  @IsNotEmpty()
  happiness1: unknown;

  @IsObject()
  @IsNotEmpty()
  happiness2: unknown;

  @IsObject()
  @IsNotEmpty()
  happiness3: unknown;

  @IsObject()
  @IsNotEmpty()
  happiness4: unknown;

  @IsObject()
  @IsNotEmpty()
  happiness5: unknown;

  @IsObject()
  @IsNotEmpty()
  happiness6: unknown;

  @ValidateNested()
  @Type(() => TimestampAttributeDto)
  timestamp: TimestampAttributeDto;

  @IsObject()
  @IsNotEmpty()
  nickname: unknown;

  @IsObject()
  @IsNotEmpty()
  age: unknown;

  @IsObject()
  @IsNotEmpty()
  address: unknown;

  @IsObject()
  @IsNotEmpty()
  memo: unknown;

  @IsObject()
  @IsNotEmpty()
  location: unknown;
}
