import { Injectable, Logger, LogLevel, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.DEFAULT })
export class LoggerService extends Logger {
  private readonly logger = new Logger(LoggerService.name);

  private readonly logLevels: Record<string, LogLevel[]> = {
    production: ['error'],
    staging: ['warn', 'error'],
    development: ['log', 'warn', 'error', 'debug', 'verbose'],
  };

  constructor() {
    super();
    this.applyLogLevels();
  }

  private applyLogLevels(): void {
    const environment = process.env.NODE_ENV || 'development';
    const levels = this.logLevels[environment] || this.logLevels['development'];
    Logger.overrideLogger(levels);
  }

  private isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  debug(message: string): void {
    this.logger.debug(message);
  }

  info(message: string): void {
    this.logger.log(message);
  }

  warn(message: string): void {
    this.logger.warn(message);
  }

  error(message: string, error?: any): void {
    if (this.isProduction()) {
      this.logger.error(message);
    } else {
      this.logger.error(message, error?.stack || error);
    }
  }
}
