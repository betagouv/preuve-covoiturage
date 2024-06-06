import { _ } from '@/deps.ts';

import {
  middleware,
  MiddlewareInterface,
  ParamsType,
  ContextType,
  ResultType,
  ForbiddenException,
  InvalidParamsException,
} from '@/ilos/common/index.ts';

import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';
import { ConfiguredMiddleware } from '@/pdc/providers/middleware/index.ts';

@middleware()
export class ChallengePasswordMiddleware implements MiddlewareInterface<ChallengePasswordMiddlewareParams> {
  constructor(protected authRepository: AuthRepositoryProviderInterfaceResolver) {}

  async process(
    params: ParamsType,
    context: ContextType,
    next: Function,
    options: ChallengePasswordMiddlewareParams,
  ): Promise<ResultType> {
    const { idPath, emailPath, passwordPath } = options;
    if (!passwordPath || (!idPath && !emailPath)) {
      throw new InvalidParamsException('Misconfigured middleware');
    }

    const password = _.get(params, passwordPath);

    if (idPath) {
      await this.challengeById(password, _.get(params, idPath));
    } else if (emailPath) {
      await this.challengeByEmail(password, _.get(params, emailPath));
    }

    return next(params, context);
  }

  protected async challengeById(password: string, id: number) {
    if (!id || !password) {
      throw new InvalidParamsException('Missing data');
    }

    if (!(await this.authRepository.challengePasswordById(id, password))) {
      throw new ForbiddenException('Wrong credentials');
    }
  }

  protected async challengeByEmail(password: string, email: string) {
    if (!email || !password) {
      throw new InvalidParamsException('Missing data');
    }

    if (!(await this.authRepository.challengePasswordByEmail(email, password))) {
      throw new ForbiddenException('Wrong credentials');
    }
  }
}

export interface ChallengePasswordMiddlewareParams {
  idPath?: string;
  emailPath?: string;
  passwordPath: string;
}

const alias = 'challenge_password';
export const challengePasswordMiddlewareBinding = [alias, ChallengePasswordMiddleware];

export function challengePasswordMiddleware(
  params: ChallengePasswordMiddlewareParams,
): ConfiguredMiddleware<ChallengePasswordMiddlewareParams> {
  return [alias, params];
}
