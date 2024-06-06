import { ContextType, handler, KernelInterfaceResolver, NotFoundException } from '@/ilos/common/index.ts';
import { RedisConnection } from '@/ilos/connection-redis/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/policy/getPastSimulationOrCompute.contract.ts';
import {
  ParamsInterface as SimulateOnPastParams,
  handlerConfig as simulatePastHandler,
  signature as simulatePastSignature,
} from '@/shared/policy/simulateOnPast.contract.ts';
import { alias } from '@/shared/policy/simulateOnPast.schema.ts';
import { RedisKey } from '@/deps.ts';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.simulate.past',
      registry: 'registry.policy.simulate.past',
    }),
  ],
})
export class GetPastSimulationOrComputeAction extends AbstractAction {
  constructor(
    private connection: RedisConnection,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const today = new Date();
    const start_date = new Date();
    start_date.setMonth(today.getMonth() - params.months);

    // 0. Returns Redis cache result for a given territory and month number if present
    const cachedResult: string = await this.connection.getClient().get(this.getSimulationCachingKey(params));
    if (cachedResult) {
      console.debug(
        `[policy] Found cached policy simulation for territory ${params.territory_id} and ${params.months} months`,
      );
      return JSON.parse(cachedResult);
    }

    this.kernel.notify<SimulateOnPastParams>(simulatePastSignature, params, {
      channel: { service: simulatePastHandler.service },
      call: context.call,
    });
    throw new NotFoundException(`[policy] No cached policy simulation for territory ${params.territory_id}`);
  }

  private getSimulationCachingKey(params: ParamsInterface): RedisKey {
    return `simulations:${params.territory_id}:${params.months}`;
  }
}
