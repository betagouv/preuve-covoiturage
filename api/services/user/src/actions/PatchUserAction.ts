import * as _ from 'lodash';

import { Parents, Container, Exceptions } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

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
        if ('aom' in params && params.aom === context.call.user.aom) {
          return 'aom.users.update';
        }
      },
      (params, context) => {
        if ('operator' in params && params.operator === context.call.user.operator) {
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

  public async handle(request: { id: string, password?: string, patch: { [prop: string]: string }}): Promise<UserDbInterface> {
    // update password && change email
    if (request.patch.newPassword) {
      return this.changePassword(request.id, request.password, request.patch);
    }
    if (request.patch.email) {
      // send email to confirm
      return this.userRepository.patch(request.id, request.patch);
    }
    return this.userRepository.patch(request.id, request.patch);
  }

  private async changePassword(id:string, currentPassword:string, data) {
    if (!currentPassword) {
      throw new Exceptions.InvalidRequestException('Missing current user hashed password');
    }
    if (!_.has(data, 'oldPassword') || !_.has(data, 'newPassword')) {
      throw new Exceptions.InvalidRequestException('Old and new passwords must be set');
    }

    if (!(await this.cryptoProvider.comparePassword(data.oldPassword, currentPassword))) {
      throw new Exceptions.ForbiddenException('Wrong credentials');
    }

    const user = await this.userRepository.find(id);
    if (!user) {
      throw new Exceptions.DDBNotFoundException('User not found');
    }

    // same password ?
    if (data.oldPassword === data.newPassword) return user;

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(data.newPassword);

    // set the permissions here as the findOneAndUpdate Mongoose middleware
    // cannot access the original document
    // user.permissions = Permissions.getFromRole(user.group, user.role);

    return this.userRepository.patch(id, { password: newHashPassword });
  }
}
