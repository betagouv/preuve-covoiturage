import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ContentWhitelistMiddleware, ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { find } from './shared/territory/find.schema';
import { create } from './shared/territory/create.schema';
import { update } from './shared/territory/update.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { findByInsee } from './shared/territory/findByInsee.schema';
import { findByPosition } from './shared/territory/findByPosition.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { FindTerritoryByInseeAction } from './actions/FindTerritoryByInseeAction';
import { FindTerritoryByPositionAction } from './actions/FindTerritoryByPositionAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { MigrateCommand } from './commands/MigrateCommand';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryRepositoryProvider],
  validator: [
    ['territory.find', find],
    ['territory.create', create],
    ['territory.update', update],
    ['territory.delete', deleteTerritory],
    ['territory.findByInsee', findByInsee],
    ['territory.findByPosition', findByPosition],
    ['territory.patchContacts', patchContacts],
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
    ListTerritoryAction,
    CreateTerritoryAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    DeleteTerritoryAction,
    FindTerritoryByInseeAction,
    FindTerritoryByPositionAction,
  ],
  commands: [MigrateCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
