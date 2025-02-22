import { Test, TestingModule } from '@nestjs/testing';
import { WeatherApiService } from './weather-api.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '../common/http/http.service';
import { LoggerService } from '../common/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  mockWeatherResponse,
  mockForecastResponse,
} from '../tests/mocks/weather';

const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'WEATHER_API_URL') return 'https://mock-api.com';
    if (key === 'WEATHER_API_KEY') return 'mock-api-key';
    return null;
  }),
};

const mockHttpService = {
  get: jest.fn(),
};

const mockLoggerService = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

describe('WeatherApiService', () => {
  let weatherApiService: WeatherApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LoggerService, useValue: mockLoggerService },
      ],
    }).compile();

    weatherApiService = module.get<WeatherApiService>(WeatherApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(weatherApiService).toBeDefined();
  });

  describe('fetchCurrentWeather', () => {
    it('should fetch current weather data successfully', async () => {
      mockHttpService.get.mockResolvedValue(mockWeatherResponse);

      const result = await weatherApiService.fetchCurrentWeather('London');

      expect(result).toEqual(mockWeatherResponse);
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Fetching weather from OpenWeather API for city: London',
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://mock-api.com/weather',
        { q: 'London', appid: 'mock-api-key', units: 'metric' },
      );
    });

    it('should throw 404 error when city is not found', async () => {
      const error = {
        response: { status: 404, data: { message: 'city not found' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchCurrentWeather('UnknownCity'),
      ).rejects.toThrow(
        new HttpException("City 'UnknownCity' not found", HttpStatus.NOT_FOUND),
      );

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'City not found: UnknownCity (404)',
      );
    });

    it('should throw 502 error when OpenWeather API fails with 5xx', async () => {
      const error = {
        response: { status: 500, data: { message: 'Server Error' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchCurrentWeather('London'),
      ).rejects.toThrow(
        new HttpException(
          'Weather service temporarily unavailable',
          HttpStatus.BAD_GATEWAY,
        ),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'OpenWeather API issue for weather of London: Server Error (5xx)',
      );
    });

    it('should throw 500 error for unexpected issues', async () => {
      const error = new Error('Unexpected error');
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchCurrentWeather('London'),
      ).rejects.toThrow(
        new HttpException(
          'Unexpected error occurred',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Unexpected error fetching weather for London: Unexpected error',
      );
    });

    it('should throw an error with the exact status code and message from API response', async () => {
      const error = {
        response: { status: 403, data: { message: 'Forbidden access' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchCurrentWeather('London'),
      ).rejects.toThrow(
        new HttpException('Forbidden access', HttpStatus.FORBIDDEN),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error fetching weather for London: Forbidden access',
      );
    });

    it('should use error.message when error.response.data.message is undefined', async () => {
      const error = {
        response: { status: 403, data: {} },
        message: 'Forbidden access',
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchCurrentWeather('London'),
      ).rejects.toThrow(
        new HttpException('Forbidden access', HttpStatus.FORBIDDEN),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error fetching weather for London: Forbidden access',
      );
    });
  });

  describe('fetchWeatherForecast', () => {
    it('should fetch forecast data successfully', async () => {
      mockHttpService.get.mockResolvedValue(mockForecastResponse);

      const result = await weatherApiService.fetchWeatherForecast('London');

      expect(result).toEqual(mockForecastResponse);
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Fetching forecast from OpenWeather API for city: London',
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        'https://mock-api.com/forecast',
        { q: 'London', appid: 'mock-api-key', units: 'metric' },
      );
    });

    it('should throw 404 error when city is not found for forecast', async () => {
      const error = {
        response: { status: 404, data: { message: 'city not found' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchWeatherForecast('UnknownCity'),
      ).rejects.toThrow(
        new HttpException("City 'UnknownCity' not found", HttpStatus.NOT_FOUND),
      );

      expect(mockLoggerService.warn).toHaveBeenCalledWith(
        'City not found: UnknownCity (404)',
      );
    });

    it('should throw 502 error when OpenWeather API fails with 5xx for forecast', async () => {
      const error = {
        response: { status: 500, data: { message: 'Server Error' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchWeatherForecast('London'),
      ).rejects.toThrow(
        new HttpException(
          'Weather service temporarily unavailable',
          HttpStatus.BAD_GATEWAY,
        ),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'OpenWeather API issue for forecast of London: Server Error (5xx)',
      );
    });

    it('should throw an error with the exact status code and message from API response', async () => {
      const error = {
        response: { status: 403, data: { message: 'Forbidden access' } },
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchWeatherForecast('London'),
      ).rejects.toThrow(
        new HttpException('Forbidden access', HttpStatus.FORBIDDEN),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error fetching forecast for London: Forbidden access',
      );
    });

    it('should use error.message when error.response.data.message is undefined', async () => {
      const error = {
        response: { status: 403, data: {} },
        message: 'Forbidden access',
      };
      mockHttpService.get.mockRejectedValue(error);

      await expect(
        weatherApiService.fetchWeatherForecast('London'),
      ).rejects.toThrow(
        new HttpException('Forbidden access', HttpStatus.FORBIDDEN),
      );

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error fetching forecast for London: Forbidden access',
      );
    });
  });
});
