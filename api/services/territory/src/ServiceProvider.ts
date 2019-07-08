import { Parents, Interfaces, Extensions, Container } from '@ilos/core';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ConfigExtension } from '@ilos/config';
import { ConnectionManagerExtension } from '@ilos/connection-manager';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';

import { AllTerritoryAction } from './actions/AllTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';

import { territoryCreateSchema } from './schemas/territoryCreateSchema';
import { territoryPatchSchema } from './schemas/territoryPatchSchema';
import { territoryDeleteSchema } from './schemas/territoryDeleteSchema';

@Container.serviceProvider({
  config: __dirname,
  providers: [
    TerritoryRepositoryProvider,
  ],
  validator: [
    ['territory.create', territoryCreateSchema],
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
  ],
  connections: [
    [MongoConnection, 'mongo'],
  ],
  handlers: [AllTerritoryAction, CreateTerritoryAction, PatchTerritoryAction, DeleteTerritoryAction],
})
export class ServiceProvider extends Parents.ServiceProvider {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    ConfigExtension,
    ConnectionManagerExtension,
    ValidatorExtension,
    Extensions.Middlewares,
    Extensions.Providers,
    Extensions.Handlers,
  ];
}
