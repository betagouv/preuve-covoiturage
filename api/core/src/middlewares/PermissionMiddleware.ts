import { InvalidParamsException, ForbiddenException } from '../exceptions';
import { ClassMiddlewareInterface } from '../interfaces/ClassMiddlewareInterface';
import { ParamsType, ResultType, ContextType } from '../types';


/**
 * Can middleware check permission in context and may throw a ForbiddenException
 *
 * @export
 * @param {...string[]} roles
 * @returns {MiddlewareInterface}
 */
export class PermissionMiddleware implements ClassMiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: Function, neededPermissions: string[]): Promise<ResultType> {
    if (!neededPermissions.length) {
      throw new InvalidParamsException('No permissions defined');
    }

    if (!('call' in context) || !('permissions' in context.call.user)) {
      throw new ForbiddenException('Invalid permissions');
    }

    const { permissions } = context.call.user;

    const pass = neededPermissions.reduce((p, c) => p && (permissions || []).indexOf(c) > -1, true);

    if (!pass) {
      throw new ForbiddenException('Invalid permissions');
    }

    return next(params, context);
  }
}
