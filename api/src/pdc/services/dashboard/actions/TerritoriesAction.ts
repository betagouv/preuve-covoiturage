import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { TerritoriesRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryProviderInterface.ts";
import { handlerConfig, ResultInterface } from "../contracts/territories/territories.contract.ts";
import { alias } from "../contracts/territories/territories.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
  ],
})
export class TerritoriesAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.repository.getTerritories();
  }
}
