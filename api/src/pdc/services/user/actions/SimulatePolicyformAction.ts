import { SimulateOnPastGeoRequiredParams } from '@shared/policy/simulateOnPastGeo.contract';
import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import {
  ParamsInterface as SimulateOnPasGeoParams,
  ResultInterface as SimulateOnPastResult,
  signature as simulateOnPastGeoSignature,
} from '@shared/policy/simulateOnPastGeo.contract';

import { handlerConfig, ParamsInterface } from '@shared/user/simulatePolicyform.contract';
import { alias } from '@shared/user/simulatePolicyform.schema';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.user.policySimulate')],
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
      const result: SimulateOnPastResult = await this.simulatePolicy(nbMonthes, params.simulation);
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
    return this.kernel.call<SimulateOnPasGeoParams>(simulateOnPastGeoSignature, simulateOnPasGeoParams, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
      },
    });
  }
}
