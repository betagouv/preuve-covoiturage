import { Types, Exceptions, Interfaces, Container } from '@ilos/core';

export type ScopeToSelfMiddlewareOptionsType = [string[], Function[]];

/*
 * Verify default permission - else verify permissions according to params, context & callback function
 */
@Container.middleware()
export class ScopeToSelfMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    options: ScopeToSelfMiddlewareOptionsType,
  ): Promise<Types.ResultType> {
    const [basePermissions, callbackPermissions] = options;
    if (!basePermissions || callbackPermissions.length === 0) {
      throw new Exceptions.InvalidParamsException('No permissions defined');
    }

    if (!context || !('call' in context) || !('permissions' in context.call.user)) {
      throw new Exceptions.ForbiddenException('Invalid permissions');
    }

    const { permissions } = context.call.user;

    // Si l'utilisateur à une des permissions "de base", on laisse passer
    if (permissions.filter((value) => -1 !== basePermissions.indexOf(value)).length) {
      return next(params, context);
    }

    for (const cb of callbackPermissions) {
      const permission = cb(params, context);
      if (permissions.indexOf(permission) > -1) {
        return next(params, context);
      }
    }
    throw new Exceptions.ForbiddenException('Invalid permissions');
  }
}
