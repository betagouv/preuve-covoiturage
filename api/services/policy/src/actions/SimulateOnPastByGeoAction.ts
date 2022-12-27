import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

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
  middlewares: [['validate', alias], ...internalOnlyMiddlewares('user')],
})
export class SimulateOnPastByGeoAction extends AbstractAction {
  private readonly DEFAULT_TIME_FRAME_6_MONTHES = 6;

  constructor(
    private kernel: KernelInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 0 Find related com
    const geoResult: GeoResultInterface = await this.findGeoBySiren(params);

    const today = new Date();
    const dateMinusOneMonth = new Date();
    dateMinusOneMonth.setMonth(today.getMonth() - (params.months | this.DEFAULT_TIME_FRAME_6_MONTHES));

    // 1. Create a fake deserialized policy
    const policyTemplate: SerializedPolicyInterface = {
      start_date: dateMinusOneMonth,
      end_date: today,
      _id: 1000,
      name: '',
      status: 'active',
      handler: params.policy_template_id,
      incentive_sum: 0,
      territory_id: 0,
      territory_selector: {
        aom: [geoResult.aom_siren],
        epci: [geoResult.epci_siren],
        reg: [geoResult.reg_siren],
      },
    };

    // 2. Find selector and instanciate policy
    const policy = await Policy.import(policyTemplate);

    // 3. Start a cursor to find trips
    const cursor = this.tripRepository.findTripByGeo(
      geoResult.coms.map((m) => m.insee),
      policy.start_date,
      policy.end_date,
    );
    let done = false;

    let carpool_subsidized = 0;
    let amount = 0;

    const store = new MetadataStore(new MemoryMetadataRepository());
    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const carpool of results.value) {
          // 3. Process stateless and stateful for each trip
          const incentive = await policy.processStateless(carpool);
          const finalIncentive = await policy.processStateful(store, incentive.export());
          const finalAmount = finalIncentive.get();
          if (finalAmount > 0) {
            carpool_subsidized += 1;
          }
          amount += finalAmount;
        }
      }
    } while (!done);

    return {
      trip_subsidized: carpool_subsidized,
      amount,
    };
  }

  private async findGeoBySiren(params: ParamsInterface) {
    const geoParamsInterface: GeoParamsInterface = {
      siren: params.territory_insee,
    };
    const geoResult: GeoResultInterface = await this.kernel.call<GeoParamsInterface>(geoSignature, geoParamsInterface, {
      call: {
        user: { permissions: ['common.territory.list'] },
      },
      channel: {
        service: handlerConfig.service,
      },
    });

    if (geoResult.coms.length === 0) {
      throw Error(`Could not find any coms for territory_insee ${params.territory_insee}`);
    }
    return geoResult;
  }
}
