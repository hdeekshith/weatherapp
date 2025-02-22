import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class HttpService {
  constructor(private readonly logger: LoggerService) {}

  async get<T>(
    url: string,
    params?: Record<string, string | undefined>,
  ): Promise<T> {
    try {
      const sanitizedParams = { ...params };
      if (sanitizedParams.appid) sanitizedParams.appid = '******';

      this.logger.debug(
        `HTTP GET Request: ${url} with params: ${JSON.stringify(sanitizedParams)}`,
      );
      const response: AxiosResponse<T> = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      this.logger.error(`HTTP GET Error: ${error.message}`, error);
      throw error;
    }
  }
}
