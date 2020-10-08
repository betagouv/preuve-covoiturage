import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common';

export type ScopeToGroupMiddlewareOptionsType = {
  global: string;
  territory: string;
  operator: string;
};

@middleware()
export class ScopeToGroupMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ScopeToGroupMiddlewareOptionsType,
  ): Promise<ResultType> {
    const { global: basePermission, territory: territoryPermission, operator: operatorPermission } = options;

    if (!basePermission || !territoryPermission || !operatorPermission) {
      throw new InvalidParamsException('No permissions defined');
    }

    let permissions = [];

    if (context.call && context.call.user && context.call.user.permissions && context.call.user.permissions.length) {
      permissions = context.call.user.permissions;
    }

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    // If the user has  basePermission --> OK
    if (permissions.indexOf(basePermission) > -1) {
      return next(params, context);
    }

    // if user group is territory and have territory permission
    if (context.call.user.territory_id && permissions.indexOf(territoryPermission) > -1) {
      const normalizedParams = { ...params };

      // if params doest have territory_id, add it
      if (!params.territory_id || !params.territory_id.length) {
        normalizedParams.territory_id = [context.call.user.territory_id];
      }
      // check if all territory_id in params are in authorized territories
      const authorizedTerritories = context.call.user.authorizedTerritories;
      if (
        Array.isArray(authorizedTerritories) &&
        Array.isArray(normalizedParams.territory_id) &&
        authorizedTerritories.length > 0 &&
        normalizedParams.territory_id.filter((id) => authorizedTerritories.indexOf(id) < 0).length === 0
      ) {
        return next(normalizedParams, context);
      }
    }

    // if user group is operator and have operator permission
    if (context.call.user.operator_id && permissions.indexOf(operatorPermission) > -1) {
      const normalizedParams = { ...params };

      // if params doest have operator_id, add it
      if (!params.operator_id || !params.operator_id.length) {
        normalizedParams.operator_id = [context.call.user.operator_id];
      }

      // check if operator_id in params is context operator_id
      if (
        Array.isArray(normalizedParams.operator_id) &&
        normalizedParams.operator_id.length === 1 &&
        normalizedParams.operator_id.indexOf(context.call.user.operator_id) !== -1
      ) {
        return next(normalizedParams, context);
      }
    }

    throw new ForbiddenException('Invalid permissions');
  }
}
