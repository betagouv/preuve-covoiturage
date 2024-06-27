import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { handlerConfig } from "@/shared/observatory/distribution/refreshAllDistribution.contract.ts";
import { DistributionRepositoryInterfaceResolver } from "../../interfaces/DistributionRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class RefreshAllDistributionAction extends AbstractAction {
  constructor(
    private distributionRepository: DistributionRepositoryInterfaceResolver,
  ) {
    super();
  }

  private readonly startDate = new Date("2020-01-01");

  get today() {
    return new Date();
  }

  get endDate() {
    return new Date(this.today.setMonth(this.today.getMonth() - 1));
  }

  public async handle(): Promise<void> {
    let currentDate = this.startDate;
    while (currentDate <= this.endDate) {
      await this.distributionRepository.deleteOneMonthDistribution({
        year: new Date(currentDate).getFullYear(),
        month: new Date(currentDate).getMonth() + 1,
      });
      await this.distributionRepository.insertOneMonthDistribution({
        year: new Date(currentDate).getFullYear(),
        month: new Date(currentDate).getMonth() + 1,
      });
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
    return;
  }
}
