import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { find } from './shared/territory/find.schema';
import { create } from './shared/territory/create.schema';
import { list } from './shared/territory/list.schema';
import { dropdown } from './shared/territory/dropdown.schema';
import { update } from './shared/territory/update.schema';
import { schema as intermediaryRelationSchema } from './shared/territory/relationUiStatus.schema';
import { schema as parentChildrenSchema } from './shared/territory/parentChildren.schema';
import { schema as findByInsee } from './shared/territory/findByInsees.schema';
import { binding as updateOperatorBinding } from './shared/territory/updateOperator.schema';
import { binding as listOperatorBinding } from './shared/territory/listOperator.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';

import { config } from './config';
import { TerritoryPgRepositoryProvider } from './providers/TerritoryPgRepositoryProvider';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { UpdateTerritoryOperatorAction } from './actions/UpdateTerritoryOperatorAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { ListTerritoryOperatorAction } from './actions/ListTerritoryOperatorAction';
import { TerritoryOperatorRepositoryProvider } from './providers/TerritoryOperatorRepositoryProvider';
import { GetTerritoryRelationUIStatusAction } from './actions/GetTerritoryRelationUIStatusAction';
import { GetTerritoryParentChildrenAction } from './actions/GetTerritoryParentChildrenAction';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { TreeTerritoryAction } from './actions/TreeTerritoryAction';
import { FindTerritoryByInseesAction } from './actions/FindTerritoryByInseesAction';
import { DropdownTerritoryAction } from './actions/DropdownTerritoryAction';

@serviceProvider({
  config,
  providers: [TerritoryPgRepositoryProvider, TerritoryOperatorRepositoryProvider],
  validator: [
    ['territory.find', find],
    ['territory.list', list],
    ['territory.dropdown', dropdown],
    ['territory.create', create],
    ['territory.update', update],
    ['territory.delete', deleteTerritory],
    ['territory.getTerritoryRelationUIStatus', intermediaryRelationSchema],
    ['territory.getParentChildren', parentChildrenSchema],
    ['territory.findByInsees', findByInsee],
    ['territory.patchContacts', patchContacts],
    updateOperatorBinding,
    listOperatorBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [
    FindTerritoryAction,
    ListTerritoryAction,
    DropdownTerritoryAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    CreateTerritoryAction,
    UpdateTerritoryOperatorAction,
    ListTerritoryOperatorAction,
    GetTerritoryRelationUIStatusAction,
    GetTerritoryParentChildrenAction,
    TreeTerritoryAction,
    FindTerritoryByInseesAction,
  ],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
