import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { differenceInSeconds } from 'date-fns';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnFuture.contract';
import { alias } from '../shared/policy/simulateOnFuture.schema';
import {
  PolicyRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterfaceResolver,
  CarpoolInterface,
  PolicyInterface,
  StatelessIncentiveInterface,
} from '../interfaces';
import { v4 } from 'uuid';
import { Policy } from '~/engine/entities/Policy';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: 'operator.simulate.future',
      registry: 'registry.simulate.future',
    }),
    ['validate', alias],
  ],
})
export class SimulateOnFutureAction extends AbstractAction {
  private static DRIVER = 1;
  private static PASSENGER = 2;

  constructor(
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Normalize trip by adding territory_id and identity stuff
    const normalizedDriverData = await this.normalize(params);
    const normalizedPassengerData = await this.normalize(params, false);

    // 2. Get involved territories
    const territories = [
      ...new Set([
        ...(await this.territoryRepository.findBySelector(normalizedDriverData.start)),
        ...(await this.territoryRepository.findBySelector(normalizedDriverData.end)),
      ]),
    ];

    // 3. Find appliable policys and instanciate them
    const policysRaw = await this.policyRepository.findWhere({
      status: 'active',
      territory_id: territories,
      datetime: normalizedDriverData.datetime,
    });

    const policies: Array<PolicyInterface> = [];
    for (const policyRaw of policysRaw) {
      policies.push(await Policy.import(policyRaw));
    }

    // 5. Process policies
    const incentives: StatelessIncentiveInterface[] = [];
    for (const policy of policies) {
      incentives.push(await policy.processStateless(normalizedDriverData));
      incentives.push(await policy.processStateless(normalizedPassengerData));
    }

    // 6. Get siret code for applied policies
    const sirets = await this.territoryRepository.findSiretById(policies.map((c) => c.territory_id));

    // 7. Normalize incentives output and return
    const normalizedIncentives = incentives
      .map((i) => i.export())
      .filter((i) => i.statelessAmount > 0)
      .map((i) => ({
        carpool_id: i.carpool_id,
        amount: i.statelessAmount,
        siret: sirets.find((s) => s._id === policies.find((c) => c._id === i.policy_id).territory_id).siret,
      }));

    return {
      journey_id: params.journey_id,
      driver: normalizedIncentives
        .filter((i) => i.carpool_id === SimulateOnFutureAction.DRIVER)
        .map((incentive, i) => ({ index: i, amount: incentive.amount, siret: incentive.siret })),
      passenger: normalizedIncentives
        .filter((i) => i.carpool_id === SimulateOnFutureAction.PASSENGER)
        .map((incentive, i) => ({ index: i, amount: incentive.amount, siret: incentive.siret })),
    };
  }

  protected async normalize(input: ParamsInterface, isDriver = true): Promise<CarpoolInterface> {
    const targetProperty = isDriver ? 'driver' : 'passenger';
    const target = input[targetProperty];

    if (!(targetProperty in input) || !target) {
      return null;
    }

    return {
      _id: isDriver ? SimulateOnFutureAction.DRIVER : SimulateOnFutureAction.PASSENGER,
      identity_uuid: v4(),
      trip_id: v4(),
      operator_siret: input.operator_id.toString(), // TODO
      operator_class: input.operator_class,
      is_over_18: target.identity.over_18,
      is_driver: isDriver,
      has_travel_pass: 'travel_pass' in target.identity,
      datetime: target.start.datetime,
      seats: 'seats' in target ? target.seats : 0,
      duration: differenceInSeconds(target.end.datetime, target.start.datetime),
      distance: target.distance,
      cost: 'contribution' in target ? target.contribution : 0,
      start: await this.territoryRepository.findByPoint(target.start),
      end: await this.territoryRepository.findByPoint(target.end),
    };
  }
}
