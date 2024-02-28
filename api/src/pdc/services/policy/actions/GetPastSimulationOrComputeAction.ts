import { ContextType, handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware';
import Redis from 'ioredis';

import {
  signature as simulatePastSignature,
  handlerConfig as simulatePastHandler,
  ParamsInterface as SimulateOnPastParams,
} from '@shared/policy/simulateOnPast.contract';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/policy/getPastSimulationOrCompute.contract';

import { RedisConnection } from '@ilos/connection-redis';
import { alias } from '@shared/policy/simulateOnPast.schema';

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
  constructor(private connection: RedisConnection, private kernel: KernelInterfaceResolver) {
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

  private getSimulationCachingKey(params: ParamsInterface): Redis.KeyType {
    return `simulations:${params.territory_id}:${params.months}`;
  }
}
