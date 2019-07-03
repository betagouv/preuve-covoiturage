import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ValidatorProvider, ValidatorProviderInterfaceResolver } from '@pdc/provider-validator';
import { MongoProvider } from '@ilos/provider-mongo';

import { CrosscheckProcessAction } from './actions/CrosscheckProcessAction';

import { CrosscheckRepositoryProviderInterfaceResolver } from './interfaces/repository/CrosscheckRepositoryProviderInterface';

import { CrosscheckRepositoryProvider } from './providers/CrosscheckRepositoryProvider';

import { crosscheckProcessSchema } from './schema/crosscheckProcessSchema';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [CrosscheckRepositoryProviderInterfaceResolver, CrosscheckRepositoryProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    MongoProvider,

  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    CrosscheckProcessAction,
  ];

  protected readonly validators: [string, any][] = [
    ['crosscheck.process', crosscheckProcessSchema],
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
