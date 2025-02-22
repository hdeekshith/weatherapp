import { Field, ObjectType, Float, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
class WeatherMain {
  @ApiProperty({ example: 19.05 })
  @Field(() => Float)
  temp: number;

  @ApiProperty({ example: 18.89 })
  @Field(() => Float)
  feels_like: number;

  @ApiProperty({ example: 19.05 })
  @Field(() => Float)
  temp_min: number;

  @ApiProperty({ example: 22.61 })
  @Field(() => Float)
  temp_max: number;

  @ApiProperty({ example: 1016 })
  @Field(() => Int)
  pressure: number;

  @ApiProperty({ example: 1016 })
  @Field(() => Int)
  sea_level: number;

  @ApiProperty({ example: 990 })
  @Field(() => Int)
  grnd_level: number;

  @ApiProperty({ example: 72 })
  @Field(() => Int)
  humidity: number;
}

@ObjectType()
class WeatherInfo {
  @ApiProperty({ example: 801 })
  @Field(() => Int)
  id: number;

  @ApiProperty({ example: 'Clouds' })
  @Field()
  main: string;

  @ApiProperty({ example: 'few clouds' })
  @Field()
  description: string;

  @ApiProperty({ example: '02n' })
  @Field()
  icon: string;
}

@ObjectType()
class Clouds {
  @ApiProperty({ example: 20 })
  @Field(() => Int)
  all: number;
}

@ObjectType()
class Wind {
  @ApiProperty({ example: 2.99 })
  @Field(() => Float)
  speed: number;

  @ApiProperty({ example: 263 })
  @Field(() => Int)
  deg: number;

  @ApiProperty({ example: 7.18 })
  @Field(() => Float)
  gust: number;
}

@ObjectType()
class Sys {
  @ApiProperty({ example: 'n' })
  @Field()
  pod: string;
}

@ObjectType()
class ForecastItem {
  @ApiProperty({ example: 1740150000 })
  @Field(() => Int)
  dt: number;

  @ApiProperty({ type: WeatherMain })
  @Field(() => WeatherMain)
  main: WeatherMain;

  @ApiProperty({ type: [WeatherInfo] })
  @Field(() => [WeatherInfo])
  weather: WeatherInfo[];

  @ApiProperty({ type: Clouds })
  @Field(() => Clouds)
  clouds: Clouds;

  @ApiProperty({ type: Wind })
  @Field(() => Wind)
  wind: Wind;

  @ApiProperty({ example: 10000 })
  @Field(() => Int)
  visibility: number;

  @ApiProperty({ example: 0 })
  @Field(() => Float)
  pop: number;

  @ApiProperty({ type: Sys })
  @Field(() => Sys)
  sys: Sys;

  @ApiProperty({ example: '2025-02-21 15:00:00' })
  @Field()
  dt_txt: string;
}

@ObjectType()
export class ForecastResponse {
  @ApiProperty({ example: '200' })
  @Field()
  cod: string;

  @ApiProperty({ example: 0 })
  @Field(() => Int)
  message: number;

  @ApiProperty({ example: 40 })
  @Field(() => Int)
  cnt: number;

  @ApiProperty({ type: [ForecastItem] })
  @Field(() => [ForecastItem])
  list: ForecastItem[];
}
