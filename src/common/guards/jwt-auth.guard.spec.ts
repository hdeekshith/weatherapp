import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TokenExpiredError } from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let jwtService: JwtService;
  let mockContext: ExecutionContext;

  beforeEach(() => {
    jwtService = new JwtService({ secret: 'test-secret' });
    guard = new JwtAuthGuard(jwtService);
  });

  it('should allow access when JWT is valid (HTTP request)', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer valid.token.here' },
        }),
      }),
      getType: () => 'http',
    } as any;

    jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: 1 });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should deny access when JWT is missing', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
      getType: () => 'http',
    } as any;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should deny access when token is expired', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer expired.token.here' },
        }),
      }),
      getType: () => 'http',
    } as any;

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new TokenExpiredError('jwt expired', new Date());
    });

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('Token has expired. Please login again'),
    );
  });

  it('should deny access when token is invalid', () => {
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer invalid.token.here' },
        }),
      }),
      getType: () => 'http',
    } as any;

    jest.spyOn(jwtService, 'verify').mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(() => guard.canActivate(mockContext)).toThrow(
      new UnauthorizedException('Authentication failed'),
    );
  });

  it('should allow access when JWT is valid (GraphQL request)', () => {
    const mockGraphQLContext = {
      getContext: () => ({
        req: { headers: { authorization: 'Bearer valid.token.here' } },
      }),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockGraphQLContext as any);

    mockContext = { getType: () => 'graphql' } as ExecutionContext;

    jest.spyOn(jwtService, 'verify').mockReturnValue({ userId: 1 });

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should deny access when JWT is missing in GraphQL request', () => {
    const mockGraphQLContext = {
      getContext: () => ({
        req: { headers: {} },
      }),
    };

    jest
      .spyOn(GqlExecutionContext, 'create')
      .mockReturnValue(mockGraphQLContext as any);

    mockContext = { getType: () => 'graphql' } as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });
});
