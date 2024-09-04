import { SimulateOnPastGeoRequiredParams } from "@/shared/policy/simulateOnPastGeo.contract.ts";
import { handler, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { UserNotificationProvider } from "../providers/UserNotificationProvider.ts";
import {
  ParamsInterface as SimulateOnPasGeoParams,
  ResultInterface as SimulateOnPastResult,
  signature as simulateOnPastGeoSignature,
} from "@/shared/policy/simulateOnPastGeo.contract.ts";

import {
  handlerConfig,
  ParamsInterface,
} from "@/shared/user/simulatePolicyform.contract.ts";
import { alias } from "@/shared/user/simulatePolicyform.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    hasPermissionMiddleware("common.user.policySimulate"),
  ],
})
export class SimulatePolicyformAction extends AbstractAction {
  readonly NB_MONHTHES_SIMULATION: number[] = [1, 3, 6];

  constructor(
    private kernel: KernelInterfaceResolver,
    private notification: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    const simulations: { [key: number]: SimulateOnPastResult } = {};
    for (const nbMonthes of this.NB_MONHTHES_SIMULATION) {
      const result: SimulateOnPastResult = await this.simulatePolicy(
        nbMonthes,
        params.simulation,
      );
      simulations[nbMonthes] = result;
    }

    this.notification.simulationEmail(params, simulations);
  }

  private async simulatePolicy(
    nbMonths: number,
    simulation: SimulateOnPastGeoRequiredParams,
  ): Promise<SimulateOnPastResult> {
    const simulateOnPasGeoParams: SimulateOnPasGeoParams = {
      ...simulation,
      months: nbMonths,
    };
    return this.kernel.call<SimulateOnPasGeoParams>(
      simulateOnPastGeoSignature,
      simulateOnPasGeoParams,
      {
        call: {
          user: {},
        },
        channel: {
          service: handlerConfig.service,
        },
      },
    );
  }
}
