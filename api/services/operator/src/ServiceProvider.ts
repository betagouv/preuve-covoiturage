import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoProviderInterfaceResolver, MongoProvider } from '@ilos/provider-mongo';

import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';

import { CommandServiceProvider } from './CommandServiceProvider';

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
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
    await super.boot();
    this.registerValidators();
  }

  private registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}
