import { ExtensionInterface, NewableType, serviceProvider } from "../../../ilos/common/index.ts";
import { ServiceProvider as AbstractServiceProvider } from "../../../ilos/core/index.ts";
import { defaultMiddlewareBindings } from "../../providers/middleware/index.ts";
import { ValidatorMiddleware as SuperStructValidator } from "../../providers/superstruct/ValidatorMiddleware.ts";
import { ValidatorExtension, ValidatorMiddleware } from "../../providers/validator/index.ts";
import { FindGeoBySirenAction } from "./actions/geo/FindGeoBySirenAction.ts";
import { CreateTerritoryAction } from "./actions/group/CreateTerritoryAction.ts";
import { DeleteTerritoryActionV2 } from "./actions/group/DeleteTerritoryActionV2.ts";
import { ListTerritoryActionV2 } from "./actions/group/ListTerritoryActionV2.ts";
import { PerimeterCommand } from "./commands/PerimeterCommand.ts";
import { config } from "./config/index.ts";
import { create } from "./contracts/create.schema.ts";
import { binding as findGeoBySirenBinding } from "./contracts/findGeoBySiren.schema.ts";
import { GeoRepositoryProvider } from "./providers/GeoRepositoryProvider.ts";
import { PerimeterRepositoryProvider } from "./providers/PerimeterRepositoryProvider.ts";
import { TerritoryRepositoryProvider } from "./providers/TerritoryRepositoryProvider.ts";

@serviceProvider({
  config,
  providers: [TerritoryRepositoryProvider, GeoRepositoryProvider, PerimeterRepositoryProvider],
  validator: [
    ["territory.create", create],
    findGeoBySirenBinding,
  ],
  middlewares: [...defaultMiddlewareBindings, [
    "validate",
    ValidatorMiddleware,
  ], ["validate-superstruct", SuperStructValidator]],
  handlers: [
    ListTerritoryActionV2,
    CreateTerritoryAction,
    DeleteTerritoryActionV2,
    FindGeoBySirenAction,
  ],
  commands: [PerimeterCommand],
})
export class TerritoryServiceProvider extends AbstractServiceProvider {
  override readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
