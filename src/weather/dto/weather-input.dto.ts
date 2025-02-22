import { Field, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

@InputType()
export class WeatherDto {
  @Field()
  @IsString()
  @Length(2, 60, { message: 'City name must be between 2 and 60 characters' })
  city: string;
}

export class WeatherRequestDto {
  @ApiProperty({
    description: 'City name must be between 2 and 60 characters',
    example: 'New York',
    minLength: 2,
    maxLength: 60,
  })
  @IsString()
  @Length(2, 60, { message: 'City name must be between 2 and 60 characters' })
  city: string;
}