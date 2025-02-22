import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FavoriteLocationDto {
  @ApiProperty({
    description: 'City name to be favorited',
    example: 'New York',
    maxLength: 60,
  })
  @IsString()
  @IsNotEmpty()
  @Field()
  @MaxLength(60, { message: 'City name cannot exceed 60 characters' })
  city: string;
}
