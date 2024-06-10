import {
  contentBlacklistMiddleware,
  hasPermissionMiddleware,
} from "@/pdc/providers/middleware/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";

import { GeoRepositoryProviderInterfaceResolver } from "../../interfaces/GeoRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/territory/findGeoBySiren.contract.ts";
import { alias } from "@/shared/territory/findGeoBySiren.schema.ts";
import { blacklist } from "../../config/filterOutput.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.territory.list"),
    ["validate", alias],
    contentBlacklistMiddleware(...blacklist),
  ],
})
export class FindGeoBySirenAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.findBySiren(params);
  }
}
