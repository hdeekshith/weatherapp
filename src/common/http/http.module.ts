import { Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { HttpService } from './http.service';

@Module({
  imports: [LoggerModule],
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
