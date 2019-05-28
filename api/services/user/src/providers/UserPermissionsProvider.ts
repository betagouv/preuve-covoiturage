import * as _ from 'lodash';

import { Container, Providers } from '@pdc/core';
import { UserPermissionsProviderInterface } from '../interfaces/UserPermissionsProviderInterface';

@Container.provider()
export class UserPermissionsProvider implements UserPermissionsProviderInterface{
  constructor(
    protected config: Providers.ConfigProvider,
  ) {
  }

  boot() {
    //
  }

  public getFromRole(type:string, role:string):string[] {
    let roles = [];
    const config = this.config.get(`${this.getType(type)}.roles`);

    if (config[role]) {
      roles = config[role].permissions;
    }

    if (!roles.length) {
      throw new Error('Unsupported roles for this type');
    }

    return _.uniq(roles);
  }

  private getType(type:string = '') {
    const lowerCaseType = type.toLowerCase().trim();
    if (this.config.get('groups.groups').indexOf(lowerCaseType) === -1) {
      throw new Error('Unsupported permission type');
    }

    return lowerCaseType;
  }
}
