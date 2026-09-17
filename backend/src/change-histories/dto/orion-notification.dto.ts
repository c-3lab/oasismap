import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsISO8601,
  IsNumber,
  Equals,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  OrionLocation,
  NgsiMetadataItem,
} from '../interface/change-histories.interface';

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

export class OrionNumberAttributeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  value: number;

  metadata?: Record<string, NgsiMetadataItem>;
}

export class OrionTextAttributeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  value: string;

  metadata?: Record<string, NgsiMetadataItem>;
}

export class OrionLocationAttributeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  value: OrionLocation;

  metadata?: Record<string, NgsiMetadataItem>;
}

export class TimestampAttributeDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsISO8601()
  value: string;

  metadata?: Record<string, NgsiMetadataItem>;
}

export class OrionNotificationEntityDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @Equals('happiness')
  type: string;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness1: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness2: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness3: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness4: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness5: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => OrionNumberAttributeDto)
  happiness6: OrionNumberAttributeDto;

  @ValidateNested()
  @Type(() => TimestampAttributeDto)
  timestamp: TimestampAttributeDto;

  @ValidateNested()
  @Type(() => OrionTextAttributeDto)
  nickname: OrionTextAttributeDto;

  @ValidateNested()
  @Type(() => OrionTextAttributeDto)
  age: OrionTextAttributeDto;

  @ValidateNested()
  @Type(() => OrionTextAttributeDto)
  address: OrionTextAttributeDto;

  @ValidateNested()
  @Type(() => OrionTextAttributeDto)
  memo: OrionTextAttributeDto;

  @ValidateNested()
  @Type(() => OrionLocationAttributeDto)
  location: OrionLocationAttributeDto;
}
