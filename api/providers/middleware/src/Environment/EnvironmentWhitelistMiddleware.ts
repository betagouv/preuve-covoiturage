import { env } from '@ilos/core';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, NotFoundException } from '@ilos/common';
import { ConfiguredMiddleware } from '../interfaces';

/*
 * Filter call from environment
 */
@middleware()
export class EnvironmentWhitelistMiddleware implements MiddlewareInterface<EnvironmentWhitelistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    environments: Partial<EnvironmentWhitelistMiddlewareParams>,
  ): Promise<ResultType> {
    const appEnv = env.or_fail('NODE_ENV');

    if (environments.indexOf(appEnv) === -1) {
      throw new NotFoundException('Missing action');
    }

    return next(params, context);
  }
}

export type EnvironmentWhitelistMiddlewareParams = string[];

const alias = 'environment.only';

export const environmentWhitelistMiddlewareBinding = [alias, EnvironmentWhitelistMiddleware];

export function environmentWhitelistMiddleware(
  ...params: EnvironmentWhitelistMiddlewareParams
): ConfiguredMiddleware<EnvironmentWhitelistMiddlewareParams> {
  return [alias, params];
}
