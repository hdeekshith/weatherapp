import { Test, TestingModule } from '@nestjs/testing';
import { WeatherResolver } from './weather.resolver';
import { WeatherService } from './weather.service';
import { Logger } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  mockWeatherResponse,
  mockForecastResponse,
} from '../tests/mocks/weather';

describe('WeatherResolver', () => {
  let weatherResolver: WeatherResolver;
  let weatherService: WeatherService;
  let loggerDebugSpy: jest.SpyInstance;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherResolver,
        {
          provide: WeatherService,
          useValue: {
            getCurrentWeather: jest.fn(),
            getWeatherForecast: jest.fn(),
          },
        },
      ],
    }).compile();

    weatherResolver = module.get<WeatherResolver>(WeatherResolver);
    weatherService = module.get<WeatherService>(WeatherService);
    reflector = module.get<Reflector>(Reflector);

    loggerDebugSpy = jest.spyOn(Logger.prototype, 'debug').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(weatherResolver).toBeDefined();
  });

  describe('getWeather', () => {
    it('should return current weather data', async () => {
      jest
        .spyOn(weatherService, 'getCurrentWeather')
        .mockResolvedValue(mockWeatherResponse);

      const result = await weatherResolver.getWeather({ city: 'Delhi' });

      expect(result).toEqual(mockWeatherResponse);
      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('Delhi');
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'GraphQL: Fetching weather for Delhi',
      );
    });

    it('should throw an error if getCurrentWeather fails', async () => {
      jest
        .spyOn(weatherService, 'getCurrentWeather')
        .mockRejectedValue(
          new HttpException(
            'Failed to fetch weather data',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );

      await expect(
        weatherResolver.getWeather({ city: 'Delhi' }),
      ).rejects.toThrow(
        new HttpException(
          'Failed to fetch weather data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('Delhi');
    });
  });

  describe('getForecast', () => {
    it('should return forecast data', async () => {
      jest
        .spyOn(weatherService, 'getWeatherForecast')
        .mockResolvedValue(mockForecastResponse);

      const result = await weatherResolver.getForecast({ city: 'Delhi' });

      expect(result).toEqual(mockForecastResponse);
      expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('Delhi');
      expect(loggerDebugSpy).toHaveBeenCalledWith(
        'GraphQL: Fetching forecast for Delhi',
      );
    });

    it('should throw an error if getWeatherForecast fails', async () => {
      jest
        .spyOn(weatherService, 'getWeatherForecast')
        .mockRejectedValue(
          new HttpException(
            'Failed to fetch forecast data',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );

      await expect(
        weatherResolver.getForecast({ city: 'Delhi' }),
      ).rejects.toThrow(
        new HttpException(
          'Failed to fetch forecast data',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );

      expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('Delhi');
    });
  });
});
