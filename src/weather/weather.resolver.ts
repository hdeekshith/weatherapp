import { Resolver, Query, Args } from '@nestjs/graphql';
import { WeatherService } from './weather.service';
import { WeatherResponse, ForecastResponse, WeatherDto } from './dto';
import { Logger } from '@nestjs/common';

@Resolver('Weather')
export class WeatherResolver {
  private readonly logger = new Logger(WeatherResolver.name);

  constructor(private readonly weatherService: WeatherService) {}

  @Query(() => WeatherResponse)
  async getWeather(@Args('input') input: WeatherDto): Promise<WeatherResponse> {
    this.logger.debug(`GraphQL: Fetching weather for ${input.city}`);
    return this.weatherService.getCurrentWeather(input.city);
  }

  @Query(() => ForecastResponse)
  async getForecast(
    @Args('input') input: WeatherDto,
  ): Promise<ForecastResponse> {
    this.logger.debug(`GraphQL: Fetching forecast for ${input.city}`);
    return this.weatherService.getWeatherForecast(input.city);
  }
}
