import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { DistributionRepositoryInterfaceResolver } from "../../interfaces/DistributionRepositoryProviderInterface.ts";
import {
  handlerConfig,
  ParamsInterface,
} from "@/shared/observatory/distribution/insertMonthlyDistribution.contract.ts";

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthDistributionAction extends AbstractAction {
  constructor(
    private distributionRepository: DistributionRepositoryInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.distributionRepository.deleteOneMonthDistribution(params);
    return this.distributionRepository.insertOneMonthDistribution(params);
  }
}
