import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common/index.ts';
import _ from 'lodash';
import { ConfiguredMiddleware } from '../interfaces.ts';

/**
 * Check if user has basePermission, if not check if contextPath equals paramsPath and challenge
 * against scoped permission.
 * Example :
 * [registry.user.list, [[ 'territory.user.list', 'call.user.territory_id', 'territory_id']]]
 *    ^ base permission       ^ scoped permission    ^ context path            ^ params path
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

    const permissions = _.get(context, 'call.user.permissions', []);

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    // If the user has basePermission --> OK
    if (permissions.indexOf(basePermission) > -1) {
      return next(params, context);
    }
    for (const [scopedPermission, contextPath, paramsPath] of permissionScopes) {
      if (
        this.belongsTo(_.get(params, paramsPath, Symbol()), _.get(context, contextPath, Symbol())) &&
        permissions.indexOf(scopedPermission) > -1
      ) {
        return next(params, context);
      }
    }

    throw new ForbiddenException('Invalid permissions');
  }

  private belongsTo(value: any | any[], list: any | any[]): boolean {
    const val = Array.isArray(value) ? value : [value];
    const lst = Array.isArray(list) ? list : [list];
    return val.reduce((p, c) => p && _.includes(lst, c), true);
  }
}

export type ScopeAndPermission = [string, string, string];
export type HasPermissionByScopeMiddlewareParams = [string | undefined, ScopeAndPermission[]];

const alias = 'has_permission.by_scope';

export const hasPermissionByScopeMiddlewareBinding = [alias, HasPermissionByScopeMiddleware];

export function hasPermissionByScopeMiddleware(
  globalPermission: string | null,
  ...scopes: ScopeAndPermission[]
): ConfiguredMiddleware<HasPermissionByScopeMiddlewareParams> {
  return [alias, [globalPermission, scopes]];
}
