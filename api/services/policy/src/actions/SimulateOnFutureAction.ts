import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { differenceInSeconds } from 'date-fns';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnFuture.contract';
import { alias } from '../shared/policy/simulateOnFuture.schema';
import { PolicyEngine } from '../engine/PolicyEngine';
import {
  CampaignRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TripInterface,
  PersonInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { InMemoryMetadataProvider } from '../engine/faker/InMemoryMetadataProvider';
import { v4 } from 'uuid';

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
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Normalize trip by adding territory_id and identity stuff
    const normalizedTrip = new TripInterface(
      ...[await this.normalize(params), await this.normalize(params, false)].filter((v) => v !== null),
    );

    if (normalizedTrip.length === 0) {
      return {
        journey_id: params.journey_id,
        passenger: [],
        driver: [],
      };
    }

    // 2. Get involved territories
    const territories = [...new Set(...normalizedTrip.map((t) => [...t.start_territory_id, ...t.end_territory_id]))];

    // 3. Instanciate an InMemory engine
    const engine = new PolicyEngine(new InMemoryMetadataProvider());

    // 4. Find appliable campaigns and instanciate them
    const campaigns = (
      await this.campaignRepository.findWhere({
        status: 'active',
        territory_id: territories,
        datetime: normalizedTrip.datetime,
      })
    ).map((c) => engine.buildCampaign(c));

    // 5. Process campaigns
    const incentives: IncentiveInterface[] = [];
    for (const campaign of campaigns) {
      incentives.push(...(await engine.process(campaign, normalizedTrip)));
    }

    // 6. Get siret code for appliable campaigns
    const sirets = await this.territoryRepository.findSiretById(campaigns.map((c) => c.territory_id));

    // 7. Normalize incentives output and return
    const normalizedIncentives = incentives
      .filter((i) => i.amount > 0)
      .map((i) => ({
        carpool_id: i.carpool_id,
        amount: i.amount,
        siret: sirets.find((s) => s._id === campaigns.find((c) => c.policy_id === i.policy_id).territory_id).siret,
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

  protected async normalize(input: ParamsInterface, isDriver = true): Promise<PersonInterface | null> {
    const targetProperty = isDriver ? 'driver' : 'passenger';
    const target = input[targetProperty];

    if (!(targetProperty in input) || !target) {
      return null;
    }

    return {
      identity_uuid: v4(),
      carpool_id: isDriver ? SimulateOnFutureAction.DRIVER : SimulateOnFutureAction.PASSENGER,
      operator_id: input.operator_id,
      operator_class: input.operator_class,
      is_over_18: target.identity.over_18,
      is_driver: isDriver,
      has_travel_pass: 'travel_pass' in target.identity,
      datetime: target.start.datetime,
      seats: 'seats' in target ? target.seats : 0,
      duration: differenceInSeconds(target.end.datetime, target.start.datetime),
      distance: target.distance,
      cost: 'contribution' in target ? target.contribution : 0,
      start_territory_id: await this.territoryRepository.findByPoint(target.start),
      end_territory_id: await this.territoryRepository.findByPoint(target.end),
    };
  }
}
