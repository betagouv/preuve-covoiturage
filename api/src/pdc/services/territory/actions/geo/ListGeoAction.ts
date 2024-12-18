import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/pdc/services/territory/contracts/listGeo.contract.ts";
import { alias } from "@/pdc/services/territory/contracts/listGeo.schema.ts";
import { GeoRepositoryProviderInterfaceResolver } from "../../interfaces/GeoRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.territory.list"),
    // set the on_territories to own authorizedZoneCodes  when user is a territory
    copyFromContextMiddleware(
      "call.user.authorizedZoneCodes.com",
      "where.insee",
    ),
    ["validate", alias],
  ],
})
export class ListGeoAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.list(params);
  }
}
