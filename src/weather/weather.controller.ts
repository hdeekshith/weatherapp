import { Controller, Get, Param, Logger } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForecastResponse, WeatherRequestDto, WeatherResponse } from './dto';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);

  constructor(private readonly weatherService: WeatherService) { }

  @Get(':city')
  @ApiOperation({ summary: 'Get current weather by city' })
  @ApiResponse({
    status: 200,
    description: 'Weather data retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid/Missing data passed' })
  @ApiResponse({ status: 404, description: 'Invalid city name' })
  async getWeather(@Param() params: WeatherRequestDto): Promise<WeatherResponse> {
    return this.weatherService.getCurrentWeather(params.city);
  }

  @Get('forecast/:city')
  @ApiOperation({ summary: 'Get weather forecast by city' })
  @ApiResponse({
    status: 200,
    description: 'Weather forecast retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid/Missing data passed' })
  @ApiResponse({ status: 404, description: 'Invalid city name' })
  async getForecast(@Param() params: WeatherRequestDto): Promise<ForecastResponse> {
    return this.weatherService.getWeatherForecast(params.city);
  }
}
