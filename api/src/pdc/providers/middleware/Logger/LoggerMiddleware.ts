import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType } from '@/ilos/common/index.ts';

import { UnconfiguredMiddleware } from '../interfaces.ts';

@middleware()
export class LoggerMiddleware implements MiddlewareInterface<LoggerMiddlewareParams> {
  async process(params: ParamsType, context: ContextType, next: Function): Promise<ResultType> {
    try {
      console.debug('Before middlewares', { params, context });
      const response = await next(params, context);
      console.debug('After middlewares', { response, params, context });
      return response;
    } catch (e) {
      console.debug('ERROR', e);
      throw e;
    }
  }
}

export type LoggerMiddlewareParams = void;

const alias = 'logger';

export const loggerMiddlewareBinding = [alias, LoggerMiddleware];

export function loggerMiddleware(): UnconfiguredMiddleware {
  return alias;
}
