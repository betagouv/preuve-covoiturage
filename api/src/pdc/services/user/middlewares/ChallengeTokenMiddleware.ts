import _ from 'lodash';
import { ConfiguredMiddleware, UnconfiguredMiddleware } from '@pdc/providers/middleware/index.ts';
import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  ForbiddenException,
  InvalidParamsException,
} from '@ilos/common/index.ts';

import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';

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
    const token = _.get(params, tokenPath);
    const email = _.get(params, emailPath);

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
