import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { CreateTerritoryAction } from './actions/group/CreateTerritoryAction';
import { ListGeoAction } from './actions/geo/ListGeoAction';
import { FindTerritoryAction } from './actions/group/FindTerritoryAction';
import { FindGeoBySirenAction } from './actions/geo/FindGeoBySirenAction';
import { ListTerritoryAction } from './actions/group/ListTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/group/PatchContactsTerritoryAction';
import { UpdateTerritoryAction } from './actions/group/UpdateTerritoryAction';
import { config } from './config';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';
import { create } from '@shared/territory/create.schema';
import { deleteTerritory } from '@shared/territory/delete.schema';
import { binding as listGeoBinding } from '@shared/territory/listGeo.schema';
import { binding as findBinding } from '@shared/territory/find.schema';
import { binding as findGeoBySirenBinding } from '@shared/territory/findGeoBySiren.schema';
import { binding as listBinding } from '@shared/territory/list.schema';
import { patchContacts } from '@shared/territory/patchContacts.schema';
import { update } from '@shared/territory/update.schema';
import { binding as getAuthorizedCodesBinding } from '@shared/territory/getAuthorizedCodes.schema';
import { GetAuthorizedCodesAction } from './actions/group/GetAuthorizedCodesAction';
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
    findGeoBySirenBinding,
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
    FindGeoBySirenAction,
    GetAuthorizedCodesAction,
  ],
  commands: [],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
