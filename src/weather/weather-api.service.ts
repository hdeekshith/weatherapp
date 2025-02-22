import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../common/http/http.service';
import { WeatherResponse, ForecastResponse } from '../weather/dto';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class WeatherApiService {
  private readonly apiUrl: string | undefined;
  private readonly apiKey: string | undefined;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    this.apiUrl = this.configService.get<string>('WEATHER_API_URL');
    this.apiKey = this.configService.get<string>('WEATHER_API_KEY');
  }

  async fetchCurrentWeather(city: string): Promise<WeatherResponse> {
    try {
      this.logger.debug(
        `Fetching weather from OpenWeather API for city: ${city}`,
      );
      return await this.httpService.get<WeatherResponse>(
        `${this.apiUrl}/weather`,
        { q: city, appid: this.apiKey, units: 'metric' },
      );
    } catch (error) {
      this.logger.error(`Error fetching weather for ${city}: ${error.message}`);
      throw this.handleApiError(error, 'weather', city);
    }
  }

  async fetchWeatherForecast(city: string): Promise<ForecastResponse> {
    try {
      this.logger.debug(
        `Fetching forecast from OpenWeather API for city: ${city}`,
      );
      return await this.httpService.get<ForecastResponse>(
        `${this.apiUrl}/forecast`,
        { q: city, appid: this.apiKey, units: 'metric' },
      );
    } catch (error) {
      this.logger.error(
        `Error fetching forecast for ${city}: ${error.message}`,
      );
      throw this.handleApiError(error, 'forecast', city);
    }
  }

  /**
   * Handles API errors from OpenWeather API
   */
  private handleApiError(error: any, endpoint: string, city: string): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 404) {
        this.logger.warn(`City not found: ${city} (404)`);
        throw new HttpException(
          `City '${city}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (status >= 500) {
        this.logger.error(
          `OpenWeather API issue for ${endpoint} of ${city}: ${message} (5xx)`,
        );
        throw new HttpException(
          'Weather service temporarily unavailable',
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.error(`Error fetching ${endpoint} for ${city}: ${message}`);
      throw new HttpException(message, status);
    }

    // Handle cases where OpenWeather API has no response
    this.logger.error(
      `Unexpected error fetching ${endpoint} for ${city}: ${error.message}`,
    );
    throw new HttpException(
      'Unexpected error occurred',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
