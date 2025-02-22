import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  mockWeatherResponse,
  mockForecastResponse,
} from '../tests/mocks/weather';

describe('WeatherController', () => {
  let weatherController: WeatherController;
  let weatherService: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeatherController],
      providers: [
        {
          provide: WeatherService,
          useValue: {
            getCurrentWeather: jest.fn(),
            getWeatherForecast: jest.fn(),
          },
        },
      ],
    }).compile();

    weatherController = module.get<WeatherController>(WeatherController);
    weatherService = module.get<WeatherService>(WeatherService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(weatherController).toBeDefined();
  });

  it('should return current weather data', async () => {
    jest
      .spyOn(weatherService, 'getCurrentWeather')
      .mockResolvedValue(mockWeatherResponse);

    const result = await weatherController.getWeather({ city: 'Delhi' });

    expect(result).toEqual(mockWeatherResponse);
    expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('Delhi');
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
      weatherController.getWeather({ city: 'Delhi' }),
    ).rejects.toThrow(
      new HttpException(
        'Failed to fetch weather data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );

    expect(weatherService.getCurrentWeather).toHaveBeenCalledWith('Delhi');
  });

  it('should return forecast data', async () => {
    jest
      .spyOn(weatherService, 'getWeatherForecast')
      .mockResolvedValue(mockForecastResponse);

    const result = await weatherController.getForecast({ city: 'Delhi' });

    expect(result).toEqual(mockForecastResponse);
    expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('Delhi');
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
      weatherController.getForecast({ city: 'Delhi' }),
    ).rejects.toThrow(
      new HttpException(
        'Failed to fetch forecast data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );

    expect(weatherService.getWeatherForecast).toHaveBeenCalledWith('Delhi');
  });
});
