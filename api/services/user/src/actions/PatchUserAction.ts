import * as _ from 'lodash';

import { Parents, Container, Exceptions } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';

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
      (params, context) => {
        if ('aom' in context.call.user.aom) {
          return 'aom.users.update';
        }
      },
      (params, context) => {
        if ('operator' in context.call.user.operator) {
          return 'operator.users.update';
        }
      },
    ]]],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: PatchUserInterface, context: UserContextInterface): Promise<UserDbInterface> {
    const contextParam: {aom?: string, operator?: string} = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    // update password && change email
    if (request.patch.newPassword) {
      return this.changePassword(request.id, request.patch);
    }
    if (request.patch.email) {
      // send email to confirm
      return this.userRepository.patchUser(request.id, request.patch, contextParam);
    }
    return this.userRepository.patchUser(request.id, request.patch, contextParam);
  }

  private async changePassword(id:string, data) {
    if (!_.has(data, 'oldPassword') || !_.has(data, 'newPassword')) { // can json schema do this ?
      throw new Exceptions.InvalidRequestException('Old and new passwords must be set');
    }

    const user = await this.userRepository.find(id);
    const currentPassword = user.password;

    if (!(await this.cryptoProvider.comparePassword(data.oldPassword, currentPassword))) {
      throw new Exceptions.ForbiddenException('Wrong credentials');
    }

    // same password ?
    if (data.oldPassword === data.newPassword) return user; // can json schema check this ?

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(data.newPassword);

    return this.userRepository.patch(id, { password: newHashPassword });
  }
}
