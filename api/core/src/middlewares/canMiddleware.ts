import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { CallType } from '../types/CallType';
import { ForbiddenException } from '../exceptions/ForbiddenException';


/**
 * Can middleware check permission in context and may throw a ForbiddenException
 * @export
 * @param {string[]} [methodPerms=[]]
 * @returns {MiddlewareInterface}
 */
export function canMiddleware(methodPerms: string[] = []): MiddlewareInterface {
  return async (call: CallType, next: Function): Promise<void> => {
    // no defined method permissions is a pass
    if (!methodPerms.length) {
      return next();
    }

    if (!('call' in call.context) || !('permissions' in call.context.call.user)) {
      throw new ForbiddenException('Invalid permissions');
    }

    const { permissions } = call.context.call.user;

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
