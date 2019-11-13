import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ContentWhitelistMiddleware, ContentBlacklistMiddleware, ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { find } from './shared/territory/find.schema';
import { create } from './shared/territory/create.schema';
import { update } from './shared/territory/update.schema';
import { binding as updateOperatorBinding } from './shared/territory/updateOperator.schema';
import { binding as listOperatorBinding } from './shared/territory/listOperator.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { findByInsee } from './shared/territory/findByInsee.schema';
import { findByPosition } from './shared/territory/findByPosition.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { TerritoryPgRepositoryProvider } from './providers/TerritoryPgRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { UpdateTerritoryOperatorAction } from './actions/UpdateTerritoryOperatorAction';
import { FindTerritoryByInseeAction } from './actions/FindTerritoryByInseeAction';
import { FindTerritoryByPositionAction } from './actions/FindTerritoryByPositionAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { MigrateCommand } from './commands/MigrateCommand';
import { MigrateDataCommand } from './commands/MigrateDataCommand';
import { ListTerritoryOperatorAction } from './actions/ListTerritoryOperatorAction';
import { TerritoryOperatorRepositoryProvider } from './providers/TerritoryOperatorRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [TerritoryPgRepositoryProvider, TerritoryOperatorRepositoryProvider],
  validator: [
    ['territory.find', find],
    ['territory.create', create],
    ['territory.update', update],
    ['territory.delete', deleteTerritory],
    ['territory.findByInsee', findByInsee],
    ['territory.findByPosition', findByPosition],
    ['territory.patchContacts', patchContacts],
    updateOperatorBinding,
    listOperatorBinding,
  ],
  middlewares: [
    ['can', PermissionMiddleware],
    ['scopeIt', ScopeToSelfMiddleware],
    ['validate', ValidatorMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['content.blacklist', ContentBlacklistMiddleware],
  ],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [
    FindTerritoryAction,
    ListTerritoryAction,
    // CreateTerritoryAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    // DeleteTerritoryAction,
    FindTerritoryByInseeAction,
    FindTerritoryByPositionAction,
    UpdateTerritoryOperatorAction,
    ListTerritoryOperatorAction,
  ],
  commands: [MigrateCommand, MigrateDataCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
