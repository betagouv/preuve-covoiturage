import { ContextType, handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { isAfter, startOfDay, startOfToday, sub, subDays } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

import { Policy } from '../engine/entities/Policy';
import { castUserStringToUTC, toISOString, toTzString, today } from '../helpers/dates.helper';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  PolicyRepositoryProviderInterfaceResolver,
  StatelessIncentiveInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces';
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  signature as handlerSignature,
} from '../shared/policy/apply.contract';
import { alias } from '../shared/policy/apply.schema';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class ApplyAction extends AbstractAction implements InitHookInterface {
  private readonly context: ContextType = {
    call: {
      user: {},
    },
    channel: {
      service: handlerConfig.service,
    },
  };

  constructor(
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(
      handlerSignature,
      {},
      {
        call: {
          user: {},
        },
        channel: {
          service: handlerConfig.service,
          metadata: {
            repeat: {
              cron: '0 3 * * *',
            },
            jobId: 'policy.apply.cron',
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_POLICY_PROCESSING', false)) {
      return;
    }

    console.debug('[policies] stateless starting');

    if (!('policy_id' in params)) {
      console.debug('[policies] dispatch processing for all active policies');
      await this.dispatch();
      return;
    }

    // cast input dates and process stateless
    const { override_from, override_until, tz } = params;
    let [from, until] = castUserStringToUTC(tz, [override_from, override_until]);

    // apply defaults
    from = from ?? subDays(today(tz), 7);
    until = until ?? today(tz);

    await this.processPolicy(params.policy_id, from, until);
    console.debug('[policies] stateless finished');
  }

  protected async dispatch(): Promise<void> {
    const policies = await this.policyRepository.findWhere({ status: 'active' });
    for (const policy of policies) {
      this.kernel.notify<ParamsInterface>(handlerSignature, { policy_id: policy._id }, this.context);
    }
  }

  protected async processPolicy(policy_id: number, override_from: Date, override_until: Date): Promise<void> {
    console.debug(
      `[policy ${policy_id}] starting` + ` from ${toTzString(override_from)}` + ` until ${toTzString(override_until)}`,
    );

    // 1. Find policy
    const policy = await Policy.import(await this.policyRepository.find(policy_id));

    // init counter and benchmark
    const bench = new Date();
    let total = 0;
    let counter = 0;

    // 2. Start a cursor to find trips
    const batchSize = 50;
    const start = isAfter(override_from, policy.start_date) ? override_from : policy.start_date;
    const end = isAfter(policy.end_date, override_until) ? override_until : policy.end_date;

    const cursor = this.tripRepository.findTripByPolicy(policy, start, end, batchSize, !!override_from);
    let done = false;

    do {
      const bs = new Date(); // benchmark start
      const incentives: Array<StatelessIncentiveInterface> = [];
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const carpool of results.value) {
          // 3. For each trip, process
          counter++;
          incentives.push(await policy.processStateless(carpool));
        }
      }

      // 4. Save incentives
      console.debug(`[policy ${policy_id}] stored ${incentives.length} incentives`);
      await this.incentiveRepository.createOrUpdateMany(incentives.map((i) => i.export()));

      // benchmark
      const ms = new Date().getTime() - bs.getTime();
      console.debug(
        `[policy ${policy._id}] ${counter} (${total}) trips done in ${ms}ms (${((counter / ms) * 1000).toFixed(3)}/s)`,
      );
      total += counter;
      counter = 0;
    } while (!done);

    console.debug(`[policy ${policy_id}] finished - ${total} in ${new Date().getTime() - bench.getTime()}ms`);
  }
}
