import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { PermissionMiddleware } from '@ilos/package-acl';

import { ValidatorProvider, ValidatorProviderInterfaceResolver, ValidatorMiddleware } from '@pdc/provider-validator';

import { TerritoryRepositoryProviderInterfaceResolver } from './interfaces/TerritoryRepositoryProviderInterface';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { AllTerritoryAction } from './actions/AllTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';

import { territoryPatchSchema } from './schemas/territoryPatchSchema';
import { territoryDeleteSchema } from './schemas/territoryDeleteSchema';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
    [TerritoryRepositoryProviderInterfaceResolver, TerritoryRepositoryProvider],
    [ValidatorProviderInterfaceResolver, ValidatorProvider],
  ];

  handlers = [AllTerritoryAction, PatchTerritoryAction, DeleteTerritoryAction];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ];

  protected readonly validators: [string, any][] = [
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
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
