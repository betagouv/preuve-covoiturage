import { Extensions, ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { territoryCreateSchema, territoryPatchSchema, territoryDeleteSchema } from '@pdc/provider-schema';

import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { AllTerritoryAction } from './actions/AllTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { FindTerritoryByInseeAction } from './actions/FindTerritoryByInseeAction';
import { FindTerritoryByPositionAction } from './actions/FindTerritoryByPositionAction';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryRepositoryProvider],
  validator: [
    ['territory.create', territoryCreateSchema],
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
  ],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware]],
  connections: [[MongoConnection, 'mongo']],
  handlers: [
    AllTerritoryAction,
    CreateTerritoryAction,
    PatchTerritoryAction,
    DeleteTerritoryAction,
    FindTerritoryByInseeAction,
    FindTerritoryByPositionAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
