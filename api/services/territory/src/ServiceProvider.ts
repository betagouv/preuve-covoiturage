import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CreateTerritoryAction } from './actions/CreateTerritoryAction';
import { ListGeoAction } from './actions/ListGeoAction';
import { FindTerritoryAction } from './actions/FindTerritoryAction';
import { FindGeoByCodeAction } from './actions/FindGeoByCodeAction';
import { ListTerritoryAction } from './actions/ListTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/PatchContactsTerritoryAction';
import { UpdateTerritoryAction } from './actions/UpdateTerritoryAction';
import { config } from './config';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { create } from './shared/territory/create.schema';
import { deleteTerritory } from './shared/territory/delete.schema';
import { binding as listGeoBinding } from './shared/territory/listGeo.schema';
import { binding as findBinding } from './shared/territory/find.schema';
import { binding as findGeoByCodeBinding } from './shared/territory/findGeoByCode.schema';
import { binding as listBinding } from './shared/territory/list.schema';
import { patchContacts } from './shared/territory/patchContacts.schema';
import { update } from './shared/territory/update.schema';
import { binding as getAuthorizedCodesBinding } from './shared/territory/getAuthorizedCodes.schema';
import { GetAuthorizedCodesAction } from './actions/GetAuthorizedCodesAction';
import { GeoRepositoryProvider } from './providers/GeoRepositoryProvider';

@serviceProvider({
  config,
  providers: [TerritoryRepositoryProvider, GeoRepositoryProvider],
  validator: [
    ['territory.create', create],
    ['territory.update', update],
    ['territory.delete', deleteTerritory],
    ['territory.patchContacts', patchContacts],
    findBinding,
    listBinding,
    findGeoByCodeBinding,
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
    FindGeoByCodeAction,
    GetAuthorizedCodesAction,
  ],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
