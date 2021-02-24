import { get } from 'lodash';
import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common';
import { ParametredMiddleware } from '../interfaces';

/**
 * Can middleware check permission in context and may throw a ForbiddenException
 *
 * @export
 * @param {...string[]} roles
 * @returns {MiddlewareInterface}
 */
@middleware()
export class HasPermissionMiddleware implements MiddlewareInterface<HasPermissionMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    neededPermissions: HasPermissionMiddlewareParams,
  ): Promise<ResultType> {
    if (!Array.isArray(neededPermissions) || neededPermissions.length === 0) {
      throw new InvalidParamsException('No permissions defined');
    }

    const permissions = get(context, 'call.user.permissions', []);

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

export type HasPermissionMiddlewareParams = string[];

const alias = 'has_permission';

export const hasPermissionMiddlewareBinding = [alias, HasPermissionMiddleware];

export function hasPermissionMiddleware(
  ...params: HasPermissionMiddlewareParams
): ParametredMiddleware<HasPermissionMiddlewareParams> {
  return [alias, params];
}
