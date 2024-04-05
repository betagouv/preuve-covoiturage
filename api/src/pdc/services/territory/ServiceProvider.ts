import { ExtensionInterface, NewableType, serviceProvider } from '@ilos/common';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { defaultMiddlewareBindings } from '@pdc/providers/middleware';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/providers/validator';
import { create } from '@shared/territory/create.schema';
import { deleteTerritory } from '@shared/territory/delete.schema';
import { binding as findBinding } from '@shared/territory/find.schema';
import { binding as findGeoBySirenBinding } from '@shared/territory/findGeoBySiren.schema';
import { binding as getAuthorizedCodesBinding } from '@shared/territory/getAuthorizedCodes.schema';
import { binding as listBinding } from '@shared/territory/list.schema';
import { binding as listGeoBinding } from '@shared/territory/listGeo.schema';
import { patchContacts } from '@shared/territory/patchContacts.schema';
import { update } from '@shared/territory/update.schema';
import { FindGeoBySirenAction } from './actions/geo/FindGeoBySirenAction';
import { IndexAllGeoAction } from './actions/geo/IndexAllGeoAction';
import { ListGeoAction } from './actions/geo/ListGeoAction';
import { CreateTerritoryAction } from './actions/group/CreateTerritoryAction';
import { FindTerritoryAction } from './actions/group/FindTerritoryAction';
import { GetAuthorizedCodesAction } from './actions/group/GetAuthorizedCodesAction';
import { ListTerritoryAction } from './actions/group/ListTerritoryAction';
import { PatchContactsTerritoryAction } from './actions/group/PatchContactsTerritoryAction';
import { UpdateTerritoryAction } from './actions/group/UpdateTerritoryAction';
import { IndexCommand } from './commands/IndexCommand';
import { config } from './config';
import { GeoRepositoryProvider } from './providers/GeoRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';

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
  handlers: [
    FindTerritoryAction,
    ListTerritoryAction,
    ListGeoAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    CreateTerritoryAction,
    FindGeoBySirenAction,
    GetAuthorizedCodesAction,
    IndexAllGeoAction,
  ],
  commands: [IndexCommand],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
