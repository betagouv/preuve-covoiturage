import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver, ConfigProvider } from '@ilos/provider-config';
import { EnvProviderInterfaceResolver, EnvProvider } from '@ilos/provider-env';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoProviderInterfaceResolver, MongoProvider } from '@ilos/provider-mongo';

import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';

import { OperatorRepositoryProviderInterfaceResolver } from './interfaces/OperatorRepositoryProviderInterface';
import { OperatorRepositoryProvider } from './providers/OperatorRepositoryProvider';

import { AllOperatorAction } from './actions/AllOperatorAction';
import { CreateOperatorAction } from './actions/CreateOperatorAction';
import { DeleteOperatorAction } from './actions/DeleteOperatorAction';
import { PatchOperatorAction } from './actions/PatchOperatorAction';

import { operatorCreateSchema } from './schemas/operatorCreateSchema';
import { operatorPatchSchema } from './schemas/operatorPatchSchema';
import { operatorDeleteSchema } from './schemas/operatorDeleteSchema';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  // readonly serviceProviders = [CommandServiceProvider];

  readonly alias = [
    [OperatorRepositoryProviderInterfaceResolver, OperatorRepositoryProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    [MongoProviderInterfaceResolver, MongoProvider],
  ];

  readonly handlers = [AllOperatorAction, CreateOperatorAction, PatchOperatorAction, DeleteOperatorAction];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ];

  protected readonly validators: [string, any][] = [
    ['operator.create', operatorCreateSchema],
    ['operator.patch', operatorPatchSchema],
    ['operator.delete', operatorDeleteSchema],
  ];

  public async boot() {
    this.registerEnv();
    this.registerConfig();
    await super.boot();
    this.registerValidators();
  }

  protected registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }

  protected registerConfig() {
    this.getContainer()
      .bind(ConfigProviderInterfaceResolver)
      .to(ConfigProvider);

    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }

  protected registerEnv() {
    if (!this.getContainer().isBound(EnvProviderInterfaceResolver)) {
      this.getContainer()
        .bind(EnvProviderInterfaceResolver)
        .to(EnvProvider);
    }
  }
}
