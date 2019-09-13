import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { territoryCreateSchema, territoryPatchSchema, territoryDeleteSchema } from '@pdc/provider-schema';
import { ContentWhitelistMiddleware, ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { SchemaTerritoryAction } from './actions/SchemaTerritoryAction';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryRepositoryProvider],
  validator: [
    ['territory.create', territoryCreateSchema],
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
  ],
  connections: [[MongoConnection, 'mongo']],
  handlers: [
    SchemaTerritoryAction,
    ListTerritoryAction,
    CreateTerritoryAction,
    PatchTerritoryAction,
    DeleteTerritoryAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
