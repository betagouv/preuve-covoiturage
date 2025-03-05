import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { PolicyStatusEnum } from "../contracts/common/interfaces/PolicyInterface.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/simulateOnFuture.contract.ts";
import { alias } from "../contracts/simulateOnFuture.schema.ts";
import { Policy } from "../engine/entities/Policy.ts";
import {
  CarpoolInterface,
  PolicyInterface,
  PolicyRepositoryProviderInterfaceResolver,
  StatelessIncentiveInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from "../interfaces/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.simulate.future",
      registry: "registry.simulate.future",
    }),
    ["validate", alias],
  ],
  apiRoute: {
    path: "/policies/simulate",
    action: "campaign:simulateOnFuture",
    method: "POST",
  },
})
export class SimulateOnFutureAction extends AbstractAction {
  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Normalize trip by adding territory_id and identity stuff
    const data = await this.normalize(params);

    // 2. Get involved territories
    const territories = [
      ...new Set([
        ...(await this.territoryRepository.findBySelector(data.start)),
        ...(await this.territoryRepository.findBySelector(data.end)),
      ]),
    ];

    // 3. Find appliable policys and instanciate them
    const policysRaw = await this.policyRepository.findWhere({
      status: PolicyStatusEnum.ACTIVE,
      territory_id: territories,
      datetime: data.datetime,
    });

    const policies: Array<PolicyInterface> = [];
    for (const policyRaw of policysRaw) {
      policies.push(await Policy.import(policyRaw));
    }

    // 5. Process policies
    const incentives: StatelessIncentiveInterface[] = [];
    for (const policy of policies) {
      incentives.push(await policy.processStateless(data));
    }

    // 6. Get siret code for applied policies
    const uuidList = await this.territoryRepository.findUUIDById(
      policies.map((c) => c.territory_id),
    );

    // 7. Normalize incentives output and return
    const normalizedIncentives = incentives
      .map((i) => i.export())
      .filter((i) => i.statelessAmount > 0)
      .map((i) => ({
        amount: i.statelessAmount,
        siret: uuidList.find((s) => s._id === policies.find((c) => c._id === i.policy_id).territory_id).uuid,
      }));

    return {
      incentives: normalizedIncentives.map((incentive, i) => ({
        index: i,
        amount: incentive.amount,
        siret: incentive.siret,
      })),
    };
  }

  protected async normalize(input: ParamsInterface): Promise<CarpoolInterface> {
    const common = {
      _id: 1,
      operator_id: 1,
      driver_identity_key: uuidV4(),
      passenger_identity_key: uuidV4(),
      operator_trip_id: uuidV4(),
      operator_journey_id: uuidV4(),
      operator_uuid: await this.territoryRepository.findUUIDByOperatorId(
        input.operator_id,
      ),
      operator_class: input.operator_class,
      passenger_is_over_18: input.passenger.identity.over_18,
      driver_has_travel_pass: "travel_pass" in input.driver.identity,
      passenger_has_travel_pass: "travel_pass" in input.passenger.identity,
      seats: input.passenger.seats,
      driver_revenue: input.driver.revenue,
      passenger_contribution: input.passenger.contribution,
      cost: input.passenger.contribution,
    };

    return {
      ...common,
      datetime: input.start.datetime,
      distance: input.distance,
      start: await this.territoryRepository.findByPoint(input.start),
      end: await this.territoryRepository.findByPoint(input.end),
      start_lat: input.start.lat,
      start_lon: input.start.lon,
      end_lat: input.end.lat,
      end_lon: input.end.lon,
    };
  }
}
