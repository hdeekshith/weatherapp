import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../../auth/entities';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): User => {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest().user;
    }

    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user;
  },
);
