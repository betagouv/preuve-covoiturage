import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common';

/**
 * Can middleware check permission in context and may throw a ForbiddenException
 *
 * @export
 * @param {...string[]} roles
 * @returns {MiddlewareInterface}
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

    let permissions = [];

    if (
      !!context.call &&
      !!context.call.user &&
      !!context.call.user.permissions &&
      !!context.call.user.permissions.length
    ) {
      permissions = context.call.user.permissions;
    }

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    const pass = neededPermissions.reduce((p, c) => p && (permissions || []).indexOf(c) > -1, true);

    if (!pass) {
      throw new ForbiddenException('Invalid permissions');
    }

    return next(params, context);
  }
}
