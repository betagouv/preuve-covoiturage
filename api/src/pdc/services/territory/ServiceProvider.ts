import { ExtensionInterface, NewableType, serviceProvider } from '/ilos/common/index.ts';
import { ServiceProvider as AbstractServiceProvider } from '/ilos/core/index.ts';
import { defaultMiddlewareBindings } from '/pdc/providers/middleware/index.ts';
import { ValidatorExtension, ValidatorMiddleware } from '/pdc/providers/validator/index.ts';
import { create } from '/shared/territory/create.schema.ts';
import { deleteTerritory } from '/shared/territory/delete.schema.ts';
import { binding as findBinding } from '/shared/territory/find.schema.ts';
import { binding as findGeoBySirenBinding } from '/shared/territory/findGeoBySiren.schema.ts';
import { binding as getAuthorizedCodesBinding } from '/shared/territory/getAuthorizedCodes.schema.ts';
import { binding as listBinding } from '/shared/territory/list.schema.ts';
import { binding as listGeoBinding } from '/shared/territory/listGeo.schema.ts';
import { patchContacts } from '/shared/territory/patchContacts.schema.ts';
import { update } from '/shared/territory/update.schema.ts';
import { FindGeoBySirenAction } from './actions/geo/FindGeoBySirenAction.ts';
import { IndexAllGeoAction } from './actions/geo/IndexAllGeoAction.ts';
import { ListGeoAction } from './actions/geo/ListGeoAction.ts';
import { CreateTerritoryAction } from './actions/group/CreateTerritoryAction.ts';
import { FindTerritoryAction } from './actions/group/FindTerritoryAction.ts';
import { GetAuthorizedCodesAction } from './actions/group/GetAuthorizedCodesAction.ts';
import { ListTerritoryAction } from './actions/group/ListTerritoryAction.ts';
import { PatchContactsTerritoryAction } from './actions/group/PatchContactsTerritoryAction.ts';
import { UpdateTerritoryAction } from './actions/group/UpdateTerritoryAction.ts';
import { IndexCommand } from './commands/IndexCommand.ts';
import { config } from './config/index.ts';
import { GeoRepositoryProvider } from './providers/GeoRepositoryProvider.ts';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider.ts';

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
