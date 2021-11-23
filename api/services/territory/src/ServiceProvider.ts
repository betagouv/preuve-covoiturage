import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { ListGeoAction } from './actions/ListGeoAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { FindTerritoryByInseesAction } from './actions/FindTerritoryByInseesAction';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { config } from './config';
import { TerritoryPgRepositoryProvider } from './providers/TerritoryPgRepositoryProvider';
import { create } from './shared/territory/create.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { binding as listGeoBinding } from './shared/territory/listGeo.schema';
import { find } from './shared/territory/find.schema';
import { schema as findByInsee } from './shared/territory/findByInsees.schema';
import { list } from './shared/territory/list.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { update } from './shared/territory/update.schema';
import { binding as getAuthorizedCodesBinding } from './shared/territory/getAuthorizedCodes.schema';
import { GetAuthorizedCodesAction } from './actions/GetAuthorizedCodesAction';

@serviceProvider({
  config,
  providers: [TerritoryPgRepositoryProvider],
  validator: [
    ['territory.find', find],
    ['territory.list', list],
    ['territory.create', create],
    ['territory.update', update],
    ['territory.delete', deleteTerritory],
    ['territory.findByInsees', findByInsee],
    ['territory.patchContacts', patchContacts],
    listGeoBinding,
    getAuthorizedCodesBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
  connections: [[PostgresConnection, 'connections.postgres']],
  handlers: [
    FindTerritoryAction,
    ListTerritoryAction,
    ListGeoAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    CreateTerritoryAction,
    FindTerritoryByInseesAction,
    GetAuthorizedCodesAction,
  ],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
