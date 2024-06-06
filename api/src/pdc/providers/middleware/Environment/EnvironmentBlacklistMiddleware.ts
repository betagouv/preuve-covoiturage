import { env } from '/ilos/core/index.ts';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, NotFoundException } from '/ilos/common/index.ts';
import { ConfiguredMiddleware } from '../interfaces.ts';

/*
 * Filter call from environment
 */
@middleware()
export class EnvironmentBlacklistMiddleware implements MiddlewareInterface<EnvironmentBlacklistMiddlewareParams> {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    environments: Partial<EnvironmentBlacklistMiddlewareParams>,
  ): Promise<ResultType> {
    const appEnv = env.or_fail('NODE_ENV');

    if (environments.indexOf(appEnv) > -1) {
      throw new NotFoundException('Missing action');
    }

    return next(params, context);
  }
}

export type EnvironmentBlacklistMiddlewareParams = string[];

const alias = 'environment.except';

export const environmentBlacklistMiddlewareBinding = [alias, EnvironmentBlacklistMiddleware];

export function environmentBlacklistMiddleware(
  ...params: EnvironmentBlacklistMiddlewareParams
): ConfiguredMiddleware<EnvironmentBlacklistMiddlewareParams> {
  return [alias, params];
}
