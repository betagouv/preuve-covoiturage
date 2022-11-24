import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPastGeo.contract';

import { MetadataStore } from '../engine/entities/MetadataStore';
import { Policy } from '../engine/entities/Policy';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { alias } from '../shared/policy/simulateOnPastGeo.schema';
import { MemoryMetadataRepository } from './../providers/MemoryMetadataRepositoryProvider';

import {
  ParamsInterface as GeoParamsInterface,
  ResultInterface as GeoResultInterface,
  signature as geoSignature,
} from '../shared/territory/findGeoBySiren.contract';

import { SerializedPolicyInterface } from '../interfaces';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias]],
})
export class SimulateOnPastByGeoAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 0 Find related com
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

    const today = new Date('2022-07-10'); // new Date();
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
