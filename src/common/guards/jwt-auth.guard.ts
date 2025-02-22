import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    let request;

    if (context.getType() === 'http') {
      // HTTP request
      request = context.switchToHttp().getRequest();
    } else {
      // GraphQL request
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    }

    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization token is missing');
    }

    try {
      const token = authHeader.split(' ')[1];
      request.user = this.jwtService.verify(token);
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Token has expired. Please login again',
        );
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
