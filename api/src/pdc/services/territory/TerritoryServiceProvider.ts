import { ExtensionInterface, NewableType, serviceProvider } from "@/ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "@/ilos/core/index.ts";
import { defaultMiddlewareBindings } from "@/pdc/providers/middleware/index.ts";
import { ValidatorMiddleware as SuperStructValidator } from "@/pdc/providers/superstruct/ValidatorMiddleware.ts";
import { ValidatorExtension, ValidatorMiddleware } from "@/pdc/providers/validator/index.ts";
import { CreateTerritoryActionV2 } from "@/pdc/services/territory/actions/group/CreateTerritoryActionV2.ts";
import { ListTerritoryActionV2 } from "@/pdc/services/territory/actions/group/ListTerritoryActionV2.ts";
import { create } from "@/pdc/services/territory/contracts/create.schema.ts";
import { deleteTerritory } from "@/pdc/services/territory/contracts/delete.schema.ts";
import { binding as findBinding } from "@/pdc/services/territory/contracts/find.schema.ts";
import { binding as findGeoBySirenBinding } from "@/pdc/services/territory/contracts/findGeoBySiren.schema.ts";
import { binding as getAuthorizedCodesBinding } from "@/pdc/services/territory/contracts/getAuthorizedCodes.schema.ts";
import { binding as listBinding } from "@/pdc/services/territory/contracts/list.schema.ts";
import { binding as listGeoBinding } from "@/pdc/services/territory/contracts/listGeo.schema.ts";
import { patchContacts } from "@/pdc/services/territory/contracts/patchContacts.schema.ts";
import { update } from "@/pdc/services/territory/contracts/update.schema.ts";
import { FindGeoBySirenAction } from "./actions/geo/FindGeoBySirenAction.ts";
import { IndexAllGeoAction } from "./actions/geo/IndexAllGeoAction.ts";
import { ListGeoAction } from "./actions/geo/ListGeoAction.ts";
import { CreateTerritoryAction } from "./actions/group/CreateTerritoryAction.ts";
import { FindTerritoryAction } from "./actions/group/FindTerritoryAction.ts";
import { GetAuthorizedCodesAction } from "./actions/group/GetAuthorizedCodesAction.ts";
import { ListTerritoryAction } from "./actions/group/ListTerritoryAction.ts";
import { PatchContactsTerritoryAction } from "./actions/group/PatchContactsTerritoryAction.ts";
import { UpdateTerritoryAction } from "./actions/group/UpdateTerritoryAction.ts";
import { IndexCommand } from "./commands/IndexCommand.ts";
import { config } from "./config/index.ts";
import { GeoRepositoryProvider } from "./providers/GeoRepositoryProvider.ts";
import { TerritoryRepositoryProvider } from "./providers/TerritoryRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [TerritoryRepositoryProvider, GeoRepositoryProvider],
  validator: [
    ["territory.create", create],
    ["territory.update", update],
    ["territory.delete", deleteTerritory],
    ["territory.patchContacts", patchContacts],
    findBinding,
    listBinding,
    findGeoBySirenBinding,
    listGeoBinding,
    getAuthorizedCodesBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ], ["validate-superstruct", SuperStructValidator]],
  handlers: [
    FindTerritoryAction,
    ListTerritoryAction,
    ListGeoAction,
    UpdateTerritoryAction,
    PatchContactsTerritoryAction,
    CreateTerritoryAction,
    FindGeoBySirenAction,
    ListTerritoryActionV2,
    CreateTerritoryActionV2,
    GetAuthorizedCodesAction,
    IndexAllGeoAction,
  ],
  commands: [IndexCommand],
})
export class TerritoryServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
