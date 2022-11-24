import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

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
import { hasPermissionMiddleware, internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { PolicyTemplateOne } from '../engine/policies/unbound/PolicyTemplateOne';

@handler({
  ...handlerConfig,
})
export class SimulateOnPastByGeoAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    try {
      // 0 Find related com
      const geoParamsInterface: GeoParamsInterface = {
        siren: params.territory_insee,
      };
      const geoResult: GeoResultInterface = await this.kernel.call<GeoParamsInterface>(
        geoSignature,
        geoParamsInterface,
        {
          call: {
            user: {},
          },
          channel: {
            service: handlerConfig.service,
          },
        },
      );

      if (geoResult.coms.length === 0) {
        throw Error(`Could not find any coms for territory_insee ${params.territory_insee}`);
      }

      const today = new Date('2022-07-10'); // new Date();
      const dateMinusOneMonth = new Date();
      dateMinusOneMonth.setMonth(today.getMonth() - 5);

      const policyTemplateOneMonth: SerializedPolicyInterface = {
        start_date: dateMinusOneMonth,
        end_date: today,
        _id: 1000,
        name: '',
        status: 'active',
        handler: params.policy_template_id,
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
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
}
