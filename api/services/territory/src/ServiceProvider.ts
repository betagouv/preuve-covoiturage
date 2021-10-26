import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { DropdownTerritoryAction } from './actions/DropdownTerritoryAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { FindTerritoryByInseesAction } from './actions/FindTerritoryByInseesAction';
import { GetTerritoryParentChildrenAction } from './actions/GetTerritoryParentChildrenAction';
import { GetTerritoryRelationUIStatusAction } from './actions/GetTerritoryRelationUIStatusAction';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { TreeTerritoryAction } from './actions/TreeTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { UpdateTerritoryOperatorAction } from './actions/UpdateTerritoryOperatorAction';
import { config } from './config';
import { TerritoryOperatorRepositoryProvider } from './providers/TerritoryOperatorRepositoryProvider';
import { TerritoryPgRepositoryProvider } from './providers/TerritoryPgRepositoryProvider';
import { create } from './shared/territory/create.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { dropdown } from './shared/territory/dropdown.schema';
import { find } from './shared/territory/find.schema';
import { schema as findByInsee } from './shared/territory/findByInsees.schema';
import { list } from './shared/territory/list.schema';
import { schema as parentChildrenSchema } from './shared/territory/parentChildren.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { schema as intermediaryRelationSchema } from './shared/territory/relationUiStatus.schema';
import { update } from './shared/territory/update.schema';
import { binding as updateOperatorBinding } from './shared/territory/updateOperator.schema';

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
