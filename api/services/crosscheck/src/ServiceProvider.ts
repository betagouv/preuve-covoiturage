import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import {ValidatorProviderInterfaceResolver} from '@ilos/provider-validator';

import { CrosscheckProcessAction } from './actions/CrosscheckProcessAction';

import {CrosscheckRepositoryProviderInterfaceResolver} from './interfaces/repository/CrosscheckRepositoryProviderInterface';

import {CrosscheckRepositoryProvider} from './providers/CrosscheckRepositoryProvider';


export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [CrosscheckRepositoryProviderInterfaceResolver, CrosscheckRepositoryProvider],
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    CrosscheckProcessAction,
  ];

  protected readonly validators: [string, any][] = [
  ];

  public async boot() {
    await super.boot();
    this.registerValidators();
    this.registerConfig();
  }

  protected registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }

  protected registerConfig() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }
}
