import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { WeatherResolver } from './weather.resolver';
import { CacheManagerModule } from '../common/cache/cache.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { HttpModule } from 'src/common/http/http.module';
import { WeatherApiService } from './weather-api.service';

@Module({
  imports: [CacheManagerModule, LoggerModule, HttpModule],
  controllers: [WeatherController],
  providers: [WeatherService, WeatherResolver, WeatherApiService],
  exports: [WeatherApiService],
})
export class WeatherModule {}
