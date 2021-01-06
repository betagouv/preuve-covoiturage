import { env } from '@ilos/core';
import { middleware, MiddlewareInterface, ParamsType, ContextType, ResultType, NotFoundException } from '@ilos/common';

export interface FeatureFlagOptions {
  allow: string[];
  deny: string[];
}

@middleware()
export class FeatureFlagMiddleware implements MiddlewareInterface {
  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    environments: Partial<FeatureFlagOptions>,
  ): Promise<ResultType> {
    const appEnv = env('NODE_ENV') as string;

    if ('allow' in environments && environments.allow.indexOf(appEnv) > -1) {
      return next(params, context);
    }

    if ('deny' in environments && environments.deny.indexOf(appEnv) > -1) {
      throw new NotFoundException('Missing action');
    }

    return next(params, context);
  }
}
