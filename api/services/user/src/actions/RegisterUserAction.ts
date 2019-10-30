import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, ConflictException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/register.contract';
import { alias } from '../shared/user/register.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * Register a new user
 */
@handler(configHandler)
export class RegisterUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    // TODO internal call only by filtering the incoming channel
    ['validate', alias],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // check for duplicates
    const found = await this.userRepository.findByEmail(request.email);
    if (found) {
      throw new ConflictException();
    }
    // TODO: refactoring

    // create the new user
    // const newHashPassword = await this.cryptoProvider.cryptPassword(request.password);

    // const user = await this.userRepository.create({
    //   ...request,
    //   password: newHashPassword,
    // });

    return found;
  }
}
