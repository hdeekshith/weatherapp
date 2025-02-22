import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const isGraphQL = !!gqlHost.getInfo();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      message =
        typeof response === 'string'
          ? response
          : (response as any)?.message || JSON.stringify(response);
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    if (isGraphQL) {
      throw new GraphQLError(message, {
        extensions: {
          code: this.getGraphQLErrorCode(status),
          httpStatus: status,
        },
      });
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    response.status(status).json({
      statusCode: status,
      message,
    });
  }

  private getGraphQLErrorCode(httpStatus: number): string {
    switch (httpStatus) {
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.BAD_GATEWAY:
        return 'BAD_GATEWAY';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      case HttpStatus.CONFLICT:
        return 'DATA_EXISTS_ALREADY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
