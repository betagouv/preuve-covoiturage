import { ContextType, handler, KernelInterfaceResolver, NotFoundException } from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { RedisKey } from "dep:redis";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/getPastSimulationOrCompute.contract.ts";
import {
  handlerConfig as simulatePastHandler,
  ParamsInterface as SimulateOnPastParams,
  signature as simulatePastSignature,
} from "../contracts/simulateOnPast.contract.ts";
import { alias } from "../contracts/simulateOnPast.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: "territory.policy.simulate.past",
      registry: "registry.policy.simulate.past",
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

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const today = new Date();
    const start_date = new Date();
    start_date.setMonth(today.getMonth() - params.months);

    // 0. Returns Redis cache result for a given territory and month number if present
    const cachedResult: string = await this.connection.getClient().get(
      this.getSimulationCachingKey(params),
    );
    if (cachedResult) {
      logger.debug(
        `[policy] Found cached policy simulation for territory ${params.territory_id} and ${params.months} months`,
      );
      return JSON.parse(cachedResult);
    }

    // TODO : Should be queued
    await this.kernel.call<SimulateOnPastParams>(simulatePastSignature, params, {
      channel: { service: simulatePastHandler.service },
      call: context.call,
    });
    throw new NotFoundException(
      `[policy] No cached policy simulation for territory ${params.territory_id}`,
    );
  }

  private getSimulationCachingKey(params: ParamsInterface): RedisKey {
    return `simulations:${params.territory_id}:${params.months}`;
  }
}
