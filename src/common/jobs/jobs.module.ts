import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from 'src/common/logger/logger.module';
import { LocationsModule } from 'src/locations/locations.module';
import { WeatherModule } from 'src/weather/weather.module';
import { WeatherService } from '../../weather/weather.service';
import { CacheManagerModule } from '../cache/cache.module';
import { HttpModule } from '../http/http.module';
import { WeatherCronService } from './weather-forecast.cron';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheManagerModule,
    LocationsModule,
    WeatherModule,
    LoggerModule,
    HttpModule,
  ],
  providers: [WeatherCronService, WeatherService],
})
export class JobsModule {}
