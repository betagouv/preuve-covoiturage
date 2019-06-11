import * as _ from 'lodash';

import { Parents, Container, Exceptions, Interfaces, Types } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';

interface PatchUserInterface {
  id: string;
  patch: { [prop: string]: string };
}


@Container.handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['validate', 'user.patch'],
    ['scopeIt', [['user.update'], [
      (params, context) => {
        if ('id' in params && params.id === context.call.user._id) {
          return 'profile.update';
        }
      },
      (_params, context) => {
        if ('aom' in context.call.user) {
          return 'aom.users.update';
        }
      },
      (_params, context) => {
        if ('operator' in context.call.user) {
          return 'operator.users.update';
        }
      },
    ]]],
  ];
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: PatchUserInterface, context: Types.ContextType): Promise<User> {
    const contextParam: {aom?: string, operator?: string} = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    // update password
    if (request.patch.newPassword) {
      return this.kernel.call(
        'user:changePassword',
        {
          id: request.id,
          newPassword: request.patch.newPassword,
          oldPassword: request.patch.oldPassword,
        },
        {
          call: context.call,
          channel: {
            ...context.channel,
            service: 'user',
          },
        },
      );
    }
    // change email
    if (request.patch.email) {
      // send email to confirm
      return this.kernel.call(
        'user:changeEmail',
        {
          id: request.id,
          email: request.patch.email,
        },
        {
          call: context.call,
          channel: {
            ...context.channel,
            service: 'user',
          },
        },
      );
    }
    return this.userRepository.patchUser(request.id, request.patch, contextParam);
  }
}
