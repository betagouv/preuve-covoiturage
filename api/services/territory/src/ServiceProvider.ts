import { Parents, Interfaces, Types } from '@ilos/core';
import { PermissionMiddleware } from '@ilos/package-acl';
import { ConfigProviderInterfaceResolver, ConfigProvider } from '@ilos/provider-config';
import { EnvProviderInterfaceResolver, EnvProvider } from '@ilos/provider-env';
import { MongoProviderInterfaceResolver, MongoProvider } from '@ilos/provider-mongo';

import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';

import { TerritoryRepositoryProviderInterfaceResolver } from './interfaces/TerritoryRepositoryProviderInterface';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { AllTerritoryAction } from './actions/AllTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';

import { territoryCreateSchema } from './schemas/territoryCreateSchema';
import { territoryPatchSchema } from './schemas/territoryPatchSchema';
import { territoryDeleteSchema } from './schemas/territoryDeleteSchema';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [TerritoryRepositoryProviderInterfaceResolver, TerritoryRepositoryProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
    [MongoProviderInterfaceResolver, MongoProvider],
    [ConfigProviderInterfaceResolver, ConfigProvider],
    [EnvProviderInterfaceResolver, EnvProvider],
  ];

  handlers = [AllTerritoryAction, CreateTerritoryAction, PatchTerritoryAction, DeleteTerritoryAction];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ];

  protected readonly validators: [string, any][] = [
    ['territory.create', territoryCreateSchema],
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
  ];

  public async boot() {
    await super.boot();
    this.registerConfig();
    this.registerValidators();
  }

  protected registerConfig() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }

  private registerValidators() {
    const validator = this.getContainer().get(ValidatorProviderInterfaceResolver);
    this.validators.forEach(([name, schema]) => {
      validator.registerValidator(schema, name);
    });
  }
}
