import { MiddlewareInterface } from '~/interfaces/MiddlewareInterface';
import { CallType } from '~/types/CallType';
import { ForbiddenException } from '~/Exceptions/ForbiddenException';

// tslint:disable-next-line
export function CanMiddleware(methodPerms: string[] = []): MiddlewareInterface {
  return async (call: CallType, next: Function): Promise<void> => {
    // no defined method permissions is a pass
    if (!methodPerms.length) {
      return next();
    }

    const { permissions } = call.context.user;

    if (methodPerms.length !== permissions.length) {
      throw new ForbiddenException('Invalid permissions');
    }

    const pass = methodPerms.reduce((p, c) => p && (permissions || []).indexOf(c) > -1, true);

    if (!pass) {
      throw new ForbiddenException('Invalid permissions');
    }

    await next();
  };
}
