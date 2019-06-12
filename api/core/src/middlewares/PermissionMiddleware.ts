import { InvalidParamsException, ForbiddenException } from '../exceptions';
import { MiddlewareInterface } from '../interfaces/MiddlewareInterface';
import { ParamsType, ResultType, ContextType } from '../types';
import { middleware } from '../container';

/**
 * Can middleware check permission in context and may throw a ForbiddenException
 */
@middleware()
export class PermissionMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    neededPermissions: string[],
  ): Promise<ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new InvalidParamsException('No permissions defined');
    }

    if (!context || !('call' in context) || !('permissions' in context.call.user)) {
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
