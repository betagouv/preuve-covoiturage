import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';
import { MemoryMetadataRepository } from './../providers/MemoryMetadataRepositoryProvider';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPastGeo.contract';
import {
  ParamsInterface as GeoParamsInterface,
  ResultInterface as GeoResultInterface,
  signature as geoSignature,
} from '../shared/territory/findGeoBySiren.contract';

import { MetadataStore } from '../engine/entities/MetadataStore';
import { Policy } from '../engine/entities/Policy';
import { SerializedPolicyInterface, TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { alias } from '../shared/policy/simulateOn.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'policy.start_date',
      endPath: 'policy.end_date',
      minStart: () => new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 31 * 5),
      maxEnd: () => new Date(),
    }),
    ...copyGroupIdAndApplyGroupPermissionMiddlewares(
      { territory: 'territory.policy.simulate.past', registry: 'registry.policy.simulate.past' },
      'policy',
    ),
  ],
})
export class SimulateOnPastAction extends AbstractAction {
  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 0 find related com
    const geoParamsInterface: GeoParamsInterface = {
      siren: params.territory_insee,
    };
    const geoResult: GeoResultInterface = await this.kernel.call<GeoParamsInterface>(geoSignature, geoParamsInterface, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
      },
    });

    const today = new Date();
    const dateMinusOneMonth = new Date();
    dateMinusOneMonth.setMonth(today.getMonth() - 1);

    const policyTemplateOneMonth: SerializedPolicyInterface = {
      start_date: dateMinusOneMonth,
      end_date: today,
      _id: 1000,
      name: '',
      status: 'active',
      handler: '',
      incentive_sum: 0,
      territory_id: 0,
      territory_selector: undefined,
    };

    // 1. Find selector and instanciate policy
    const policy = await Policy.import(policyTemplateOneMonth);

    // 2. Start a cursor to find trips
    const cursor = this.tripRepository.findTripByGeo(
      geoResult.coms.map((m) => m.insee),
      policy.start_date,
      policy.end_date,
    );
    let done = false;

    let carpool_total = 0;
    let carpool_subsidized = 0;
    let amount = 0;

    const store = new MetadataStore(new MemoryMetadataRepository());
    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const carpool of results.value) {
          // 3. For each trip, process
          const incentive = await policy.processStateless(carpool);
          const finalIncentive = await policy.processStateful(store, incentive.export());
          const finalAmount = finalIncentive.get();
          carpool_total += 1;
          if (finalAmount > 0) {
            carpool_subsidized += 1;
          }
          amount += finalAmount;
        }
      }
    } while (!done);

    return {
      trip_subsidized: carpool_subsidized,
      trip_excluded: carpool_total / 2 - carpool_subsidized,
      amount,
    };
  }
}
