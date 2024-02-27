import { get } from 'lodash';
import { ConfiguredMiddleware, UnconfiguredMiddleware } from '@pdc/providers/middleware';
import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  ForbiddenException,
  InvalidParamsException,
} from '@ilos/common';

import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

@middleware()
export class ChallengeTokenMiddleware implements MiddlewareInterface<ChallengeTokenMiddlewareParams> {
  constructor(protected authRepository: AuthRepositoryProviderInterfaceResolver) {}

  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ChallengeTokenMiddlewareParams = { tokenPath: 'token', emailPath: 'email' },
  ): Promise<ResultType> {
    const { tokenPath, emailPath } = options;
    const token = get(params, tokenPath);
    const email = get(params, emailPath);

    if (!token || !email) {
      throw new InvalidParamsException('Missing data');
    }

    if (!(await this.authRepository.challengeTokenByEmail(email, token))) {
      throw new ForbiddenException('Wrong token');
    }

    return next(params, context);
  }
}

export interface ChallengeTokenMiddlewareParams {
  tokenPath: string;
  emailPath: string;
}

const alias = 'challenge_token';
export const challengeTokenMiddlewareBinding = [alias, ChallengeTokenMiddleware];

export function challengeTokenMiddleware(
  params?: ChallengeTokenMiddlewareParams,
): ConfiguredMiddleware<ChallengeTokenMiddlewareParams> | UnconfiguredMiddleware {
  return params ? [alias, params] : alias;
}
