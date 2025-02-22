import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LocationsService } from '../../locations/locations.service';
import { WeatherService } from '../../weather/weather.service';
import { CacheManagerService } from '../cache/cache.service';
import { CACHE_KEYS } from '../constant';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class WeatherCronService {
  constructor(
    private readonly cacheManagerService: CacheManagerService,
    private readonly weatherService: WeatherService,
    private readonly locationsService: LocationsService,
    private readonly logger: LoggerService,
  ) { }

  @Cron(CronExpression.EVERY_3_HOURS)
  async updateWeatherForecastForFavorites(): Promise<void> {
    this.logger.info('Updating weather data for favorite locations...');
    let uniqueCities: string[];

    try {
      uniqueCities = await this.locationsService.getUniqueCities();
    } catch (error) {
      this.logger.error('Failed to fetch unique cities', error);
      return;
    }

    for (const city of uniqueCities) {
      try {
        const weatherData = await this.weatherService.getWeatherForecast(city, {
          forceRefresh: true,
        });

        await this.cacheManagerService.set(
          CACHE_KEYS.FORECAST(city),
          JSON.stringify(weatherData),
          6 * 60, // Cache for 6 hours
        );

        this.logger.debug(`Updated forecast for ${city}`);
      } catch (error) {
        this.logger.error(
          `Failed to update forecast for ${city}: ${error.message}`,
          error,
        );
      }
    }
  }
}
