import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { ConfigService } from '@nestjs/config';
import { CacheManagerService } from '../common/cache/cache.service';
import { LoggerService } from '../common/logger/logger.service';
import { WeatherApiService } from './weather-api.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  mockWeatherResponse,
  mockForecastResponse,
} from '../tests/mocks/weather';

const mockCacheManagerService = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockLoggerService = {
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'WEATHER_API_URL') return 'https://mock-api.com';
    if (key === 'WEATHER_API_KEY') return 'mock-api-key';
    return null;
  }),
};

const mockWeatherApiService = {
  fetchCurrentWeather: jest.fn().mockResolvedValue(mockWeatherResponse),
  fetchWeatherForecast: jest.fn().mockResolvedValue(mockForecastResponse),
};

describe('WeatherService', () => {
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CacheManagerService, useValue: mockCacheManagerService },
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: WeatherApiService, useValue: mockWeatherApiService },
      ],
    }).compile();

    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(weatherService).toBeDefined();
  });

  describe('getCurrentWeather', () => {
    it('should return cached weather data', async () => {
      mockCacheManagerService.get.mockResolvedValue(
        JSON.stringify(mockWeatherResponse),
      );

      const result = await weatherService.getCurrentWeather('London');
      expect(result).toEqual(mockWeatherResponse);
      expect(mockCacheManagerService.get).toHaveBeenCalledWith(
        'weather_London',
      );
      expect(mockWeatherApiService.fetchCurrentWeather).not.toHaveBeenCalled();
    });

    it('should fetch weather data from API when cache is empty', async () => {
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchCurrentWeather.mockResolvedValue(
        mockWeatherResponse,
      );

      const result = await weatherService.getCurrentWeather('London');
      expect(result).toEqual(mockWeatherResponse);
      expect(mockWeatherApiService.fetchCurrentWeather).toHaveBeenCalledWith(
        'London',
      );
      expect(mockCacheManagerService.set).toHaveBeenCalledWith(
        'weather_London',
        JSON.stringify(mockWeatherResponse),
        5,
      );
    });

    it('should return 404 when city is not found', async () => {
      const error = new HttpException(
        "City 'UnknownCity' not found",
        HttpStatus.NOT_FOUND,
      );
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchCurrentWeather.mockRejectedValue(error);

      await expect(
        weatherService.getCurrentWeather('UnknownCity'),
      ).rejects.toThrow(error);
    });

    it('should return 502 when OpenWeather API fails with 5xx', async () => {
      const error = new HttpException(
        'Weather service temporarily unavailable',
        HttpStatus.BAD_GATEWAY,
      );
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchCurrentWeather.mockRejectedValue(error);

      await expect(weatherService.getCurrentWeather('London')).rejects.toThrow(
        error,
      );
    });

    it('should return 500 for unexpected errors', async () => {
      const error = new Error('Unexpected error');
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchCurrentWeather.mockRejectedValue(error);

      await expect(weatherService.getCurrentWeather('London')).rejects.toThrow(
        new HttpException('Unexpected error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });

  describe('getWeatherForecast', () => {
    it('should return cached forecast data', async () => {
      mockCacheManagerService.get.mockResolvedValue(
        JSON.stringify(mockForecastResponse),
      );

      const result = await weatherService.getWeatherForecast('London');
      expect(result).toEqual(mockForecastResponse);
      expect(mockCacheManagerService.get).toHaveBeenCalledWith(
        'forecast_London',
      );
      expect(mockWeatherApiService.fetchWeatherForecast).not.toHaveBeenCalled();
    });

    it('should fetch forecast data from API when cache is empty', async () => {
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchWeatherForecast.mockResolvedValue(
        mockForecastResponse,
      );

      const result = await weatherService.getWeatherForecast('London');
      expect(result).toEqual(mockForecastResponse);
      expect(mockWeatherApiService.fetchWeatherForecast).toHaveBeenCalledWith(
        'London',
      );
      expect(mockCacheManagerService.set).toHaveBeenCalledWith(
        'forecast_London',
        JSON.stringify(mockForecastResponse),
        6 * 60,
      );
    });

    it('should return 404 when city is not found for forecast', async () => {
      const error = new HttpException(
        "City 'UnknownCity' not found",
        HttpStatus.NOT_FOUND,
      );
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchWeatherForecast.mockRejectedValue(error);

      await expect(
        weatherService.getWeatherForecast('UnknownCity'),
      ).rejects.toThrow(error);
    });

    it('should return 502 when OpenWeather API fails with 5xx for forecast', async () => {
      const error = new HttpException(
        'Weather service temporarily unavailable',
        HttpStatus.BAD_GATEWAY,
      );
      mockCacheManagerService.get.mockResolvedValue(null);
      mockWeatherApiService.fetchWeatherForecast.mockRejectedValue(error);

      await expect(weatherService.getWeatherForecast('London')).rejects.toThrow(
        error,
      );
    });
  });
});
