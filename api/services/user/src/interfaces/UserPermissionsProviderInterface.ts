import { Interfaces } from '@pdc/core';

export interface UserPermissionsProviderInterface extends Interfaces.ProviderInterface {
  boot();
  getFromRole(type, role):string[];
}

export abstract class UserPermissionsProviderInterfaceResolver implements Interfaces.ProviderInterface {
  boot(): Promise<void> | void {
    //
  }

  public getFromRole(type, role):string[] {
    return;
  }
}
