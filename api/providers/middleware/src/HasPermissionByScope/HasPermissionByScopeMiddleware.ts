import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common';
import { get } from 'lodash';
import { ParametredMiddleware } from '../interfaces';

/*
 * Verify default permission - else verify permissions according to params, context & callback function
 */
@middleware()
export class HasPermissionByScopeMiddleware implements MiddlewareInterface<HasPermissionByScopeMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: HasPermissionByScopeMiddlewareParams,
  ): Promise<ResultType> {
    const [basePermission, permissionScopes] = options;

    if (!permissionScopes.length) {
      throw new InvalidParamsException('No permissions defined');
    }

    const permissions = get(context, 'call.user.permissions', []);

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    // If the user has basePermission --> OK
    if (permissions.indexOf(basePermission) > -1) {
      return next(params, context);
    }

    for (const [scopedPermission, contextPath, paramsPath] of permissionScopes) {
      if (
        get(context, contextPath, Symbol()) === get(params, paramsPath, Symbol()) &&
        permissions.indexOf(scopedPermission) > -1
      ) {
        return next(params, context);
      }
    }

    throw new ForbiddenException('Invalid permissions');
  }
}

export type ScopeAndPermission = [string, string, string];
export type HasPermissionByScopeMiddlewareParams = [string | undefined, ScopeAndPermission[]];

const alias = 'has_permission_by_scope';

export const hasPermissionByScopeMiddlewareBinding = [alias, HasPermissionByScopeMiddleware];

export function hasPermissionByScopeMiddleware(
  globalPermission: string | null,
  ...scopes: ScopeAndPermission[]
): ParametredMiddleware<HasPermissionByScopeMiddlewareParams> {
  return [alias, [globalPermission, scopes]];
}
