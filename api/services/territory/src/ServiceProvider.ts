import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  territoryCreateSchema,
  territoryPatchSchema,
  territoryDeleteSchema,
  territoryFindByInseeSchema,
  territoryFindByPositionSchema,
  territoryFindSchema,
  territoryPatchContactsSchema,
} from '@pdc/provider-schema';
import { ContentWhitelistMiddleware, ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { PatchTerritoryAction } from './actions/PatchTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { SchemaTerritoryAction } from './actions/SchemaTerritoryAction';
import { FindTerritoryByInseeAction } from './actions/FindTerritoryByInseeAction';
import { FindTerritoryByPositionAction } from './actions/FindTerritoryByPositionAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryRepositoryProvider],
  validator: [
    ['territory.find', territoryFindSchema],
    ['territory.create', territoryCreateSchema],
    ['territory.patch', territoryPatchSchema],
    ['territory.delete', territoryDeleteSchema],
    ['territory.findByInsee', territoryFindByInseeSchema],
    ['territory.findByPosition', territoryFindByPositionSchema],
    ['territory.patchContacts', territoryPatchContactsSchema],
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
  ],
  connections: [[MongoConnection, 'mongo']],
  handlers: [
    FindTerritoryAction,
    SchemaTerritoryAction,
    ListTerritoryAction,
    CreateTerritoryAction,
    PatchTerritoryAction,
    PatchContactsTerritoryAction,
    DeleteTerritoryAction,
    FindTerritoryByInseeAction,
    FindTerritoryByPositionAction,
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
