import { handler } from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import {
  copyFromContextMiddleware,
  validateDateMiddleware,
} from "@/pdc/providers/middleware/index.ts";
import * as middlewareConfig from "../config/middlewares.ts";
import { fillWithZeroes } from "../helpers/fillWithZeroesHelper.ts";
import { StatCacheRepositoryProviderInterfaceResolver } from "../interfaces/StatCacheRepositoryProviderInterface.ts";
import { StatInterface } from "../interfaces/StatInterface.ts";
import { groupPermissionMiddlewaresHelper } from "../middleware/groupPermissionMiddlewaresHelper.ts";
import { TripRepositoryProvider } from "../providers/TripRepositoryProvider.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/trip/stats.contract.ts";
import { alias } from "@/shared/trip/stats.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", true),
    ...groupPermissionMiddlewaresHelper({
      territory: "territory.trip.stats",
      operator: "operator.trip.stats",
      registry: "registry.trip.stats",
    }),
    ["validate", alias],
    validateDateMiddleware({
      startPath: "date.start",
      endPath: "date.end",
      minStart: () =>
        new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () =>
        new Date(new Date().getTime() - middlewareConfig.date.maxEndDefault),
      applyDefault: true,
    }),
  ],
})
export class StatsAction extends Action {
  constructor(
    private pg: TripRepositoryProvider,
    private cache: StatCacheRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return (
      (await this.cache.getOrBuild(async () => {
        const statInterface: StatInterface[] = await this.pg.stats(params);
        return statInterface.length === 0
          ? []
          : fillWithZeroes(statInterface, params);
      }, params)) || []
    );
  }
}
