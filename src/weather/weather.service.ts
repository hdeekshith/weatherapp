import { Injectable } from '@nestjs/common';
import { CacheManagerService } from '../common/cache/cache.service';
import { ForecastResponse, WeatherResponse } from './dto';
import { LoggerService } from '../common/logger/logger.service';
import { WeatherApiService } from './weather-api.service';
import { CACHE_KEYS } from '../common/constant';

@Injectable()
export class WeatherService {
  constructor(
    private readonly cacheService: CacheManagerService,
    private readonly logger: LoggerService,
    private readonly weatherApiService: WeatherApiService,
  ) {}

  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      const cacheKey = CACHE_KEYS.WEATHER(city);
      const cachedData = await this.cacheService.get<string>(cacheKey);
      if (cachedData) {
        this.logger.debug(`Cache hit for city: ${city}`);
        return JSON.parse(cachedData) as WeatherResponse;
      }

      this.logger.info(`Fetching weather from API for city: ${city}`);
      const weatherData =
        await this.weatherApiService.fetchCurrentWeather(city);
      await this.cacheService.set(cacheKey, JSON.stringify(weatherData), 5); // Cache for 5 min
      return weatherData;
    } catch (error) {
      throw error;
    }
  }

  async getWeatherForecast(
    city: string,
    options?: { forceRefresh?: boolean },
  ): Promise<ForecastResponse> {
    try {
      const cacheKey = CACHE_KEYS.FORECAST(city);

      if (!options?.forceRefresh) {
        const cachedData = await this.cacheService.get<string>(cacheKey);
        if (cachedData) {
          this.logger.debug(`Cache hit for forecast of city: ${city}`);
          return JSON.parse(cachedData) as ForecastResponse;
        }
      }

      this.logger.info(`Fetching weather forecast for city: ${city}`);

      const forecastData =
        await this.weatherApiService.fetchWeatherForecast(city);

      await this.cacheService.set(
        cacheKey,
        JSON.stringify(forecastData),
        6 * 60,
      ); // Cache for 6 hours

      return forecastData;
    } catch (error) {
      throw error;
    }
  }
}
