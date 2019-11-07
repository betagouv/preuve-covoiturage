import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ContentWhitelistMiddleware, ContentBlacklistMiddleware } from '@pdc/provider-middleware';

import { find } from './shared/territory/find.schema';
import { create } from './shared/territory/create.schema';
import { update } from './shared/territory/update.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { findByInsee } from './shared/territory/findByInsee.schema';
import { findByPosition } from './shared/territory/findByPosition.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { TerritoryPgRepositoryProvider } from './providers/TerritoryPgRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { DeleteTerritoryAction } from './actions/DeleteTerritoryAction';
import { FindTerritoryByInseeAction } from './actions/FindTerritoryByInseeAction';
import { FindTerritoryByPositionAction } from './actions/FindTerritoryByPositionAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { MigrateCommand } from './commands/MigrateCommand';
import { MigrateDataCommand } from './commands/MigrateDataCommand';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryPgRepositoryProvider],
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
  connections: [[PostgresConnection, 'connections.postgres']],
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
  commands: [MigrateCommand, MigrateDataCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
