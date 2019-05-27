import { Types, Exceptions, Interfaces } from '@pdc/core';

export type ScopeToSelfMiddlewareOptionsType = [ string[], Function[]];

export class ScopeToSelfMiddleware implements Interfaces.MiddlewareInterface {
  async process(params: Types.ParamsType, context: Types.ContextType, next: Function, options: ScopeToSelfMiddlewareOptionsType): Promise<Types.ResultType> {
    const [ basePermission, callbackPermissions ] = options;
    if (!basePermission || callbackPermissions.length === 0) {
      throw new Exceptions.InvalidParamsException('No permissions defined');
    }

    if (!context || !('call' in context) || !('permissions' in context.call.user)) {
      throw new Exceptions.ForbiddenException('Invalid permissions');
    }

    const { permissions } = context.call.user;

    // Si l'utilisateur à la permission "de base", on laisse passer
    if (permissions.indexOf(basePermission) > - 1) {
      return next(params, context);
    }

    for(const cb of callbackPermissions) {
      const permission = cb(params, context);
      if (permissions.indexOf(permission) > -1) {
        return next(params, context);
      }
    }
    throw new Exceptions.ForbiddenException('Invalid permissions');
  }
}

// ['scopeIt', [['user.create'], [
//   (params, context) => {
//     if ('aom' in params) {
//       if (params.aom === context.call.user.aom) {
//         return 'user-create-aom';
//       }
//     }
//   },
//   (params) => {
//     if('operator' in params) {
//       return 'user-create-operator';
//     }
//     return [];
//   }
// ]]];

// ['scopeIt', [['user.read'], [
//   (params, context) => {
//     if (params._id === context.call.user._id) {
//         return 'profile.read';
//     }
//   },
// ]]];
