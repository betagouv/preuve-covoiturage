import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  InvalidParamsException,
  ForbiddenException,
} from '@ilos/common';

export type ScopeToSelfMiddlewareOptionsType = [string[], Function[]];

/*
 * Verify default permission - else verify permissions according to params, context & callback function
 */
@middleware()
export class ScopeToSelfMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ScopeToSelfMiddlewareOptionsType,
  ): Promise<ResultType> {
    // TODO remove when Auth is OK !
    if (process.env.NODE_ENV === 'local') {
      console.log('> scopeIt skipped');
      return next(params, context);
    }

    const [basePermissions, callbackPermissions] = options;

    if (!basePermissions || callbackPermissions.length === 0) {
      throw new InvalidParamsException('No permissions defined');
    }

    let permissions = [];

    if (context.call && context.call.user && context.call.user.permissions && context.call.user.permissions.length) {
      permissions = context.call.user.permissions;
    }

    if (permissions.length === 0) {
      throw new ForbiddenException('Invalid permissions');
    }

    // If the user has one of basePermissions --> OK
    if (permissions.filter((value) => -1 !== basePermissions.indexOf(value)).length) {
      return next(params, context);
    }

    for (const cb of callbackPermissions) {
      const permission = cb(params, context);
      if (permissions.indexOf(permission) > -1) {
        return next(params, context);
      }
    }
    throw new ForbiddenException('Invalid permissions');
  }
}
