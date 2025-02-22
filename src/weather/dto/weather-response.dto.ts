import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
class Coordinates {
  @Field(() => Float)
  lon: number;

  @Field(() => Float)
  lat: number;
}

@ObjectType()
class WeatherDetails {
  @Field(() => Int)
  id: number;

  @Field()
  main: string;

  @Field()
  description: string;

  @Field()
  icon: string;
}

@ObjectType()
class MainWeather {
  @Field(() => Float)
  temp: number;

  @Field(() => Float)
  feels_like: number;

  @Field(() => Float)
  temp_min: number;

  @Field(() => Float)
  temp_max: number;

  @Field(() => Int)
  pressure: number;

  @Field(() => Int)
  humidity: number;

  @Field(() => Int, { nullable: true })
  sea_level?: number;

  @Field(() => Int, { nullable: true })
  grnd_level?: number;
}

@ObjectType()
class WindWeather {
  @Field(() => Float)
  speed: number;

  @Field(() => Int)
  deg: number;
}

@ObjectType()
class CloudsWeather {
  @Field(() => Int)
  all: number;
}

@ObjectType()
class SysWeather {
  @Field(() => Int)
  type: number;

  @Field(() => Int)
  id: number;

  @Field()
  country: string;

  @Field(() => Int)
  sunrise: number;

  @Field(() => Int)
  sunset: number;
}

@ObjectType()
export class WeatherResponse {
  @Field(() => Coordinates)
  coord: Coordinates;

  @Field(() => [WeatherDetails])
  weather: WeatherDetails[];

  @Field()
  base: string;

  @Field(() => MainWeather)
  main: MainWeather;

  @Field(() => Int)
  visibility: number;

  @Field(() => WindWeather)
  wind: WindWeather;

  @Field(() => CloudsWeather)
  clouds: CloudsWeather;

  @Field(() => Int)
  dt: number;

  @Field(() => SysWeather)
  sys: SysWeather;

  @Field(() => Int)
  timezone: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Int)
  cod: number;
}
