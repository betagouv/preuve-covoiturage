import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@ilos/common';

/*
 * ByPass middleware.
 * Use to override a middleware when needed locally
 * e.g. import { NoopMiddleware as PermissionMiddleware } from '@pdc/provider-middleware'
 */
@middleware()
export class NoopMiddleware implements MiddlewareInterface {
  async process(params: ParamsType, context: ContextType, next: Function): Promise<ResultType> {
    if (process.env.NODE_ENV !== 'local') {
      throw new Error('Noop Middleware cannot be used outside of local environment');
    }

    return next(params, context);
  }
}
