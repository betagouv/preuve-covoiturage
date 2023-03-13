import {
  ContextType,
  handler,
  InitHookInterface,
  InvalidParamsException,
  KernelInterfaceResolver,
  NotFoundException,
} from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { isAfter } from 'date-fns';
import { Policy } from '../engine/entities/Policy';
import { subDaysTz, today, toTzString } from '../helpers/dates.helper';
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
import { signature } from '../shared/policy/finalize.contract';

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

    // either dispatch the same action for all active policies to the worker
    // or process current policy with given dates or defaults
    if (!('policy_id' in params)) {
      await this.dispatch();
    } else {
      const { from: f, to: t, tz, override } = params;
      const from = f ?? subDaysTz(today(tz), 7);
      const to = t ?? today(tz);

      console.info(`[campaign:apply] processing policy ${params.policy_id}`);
      await this.processPolicy(params.policy_id, from, to, override);

      // To make sure the apply action has completed before finalizing
      // it is possible to chain the actions.
      // Warning: Finalize targets ALL pending incentives. It is not restricted
      //          to a single policy_id
      if (params.finalize) {
        console.info(`[campaign:apply] finalizing policy ${params.policy_id}`);
        const context: ContextType = { channel: { service: 'campaign' } };
        await this.kernel.call(signature, { from, to }, context);
      }
    }

    console.debug('[policies] stateless finished');
  }

  protected async dispatch(): Promise<void> {
    const policies = await this.policyRepository.findWhere({ status: 'active' });
    for (const policy of policies) {
      console.debug(`[policies] dispatch processing for active policy ${policy._id}`);
      this.kernel.notify<ParamsInterface>(handlerSignature, { policy_id: policy._id }, this.context);
    }
  }

  protected async processPolicy(policy_id: number, from: Date, to: Date, override = false): Promise<void> {
    // 1. Find policy
    const pol = await this.policyRepository.find(policy_id);
    if (!pol) {
      throw new NotFoundException(`[policy ${policy_id}] Not found`);
    }

    const policy = await Policy.import(pol);

    // init counter and benchmark
    const bench = new Date();
    let total = 0;
    let counter = 0;

    // 2. Start a cursor to find trips
    const start = isAfter(from, policy.start_date) ? from : policy.start_date;
    const end = isAfter(policy.end_date, to) ? to : policy.end_date;
    const s = toTzString(start);
    const e = toTzString(end);

    // throw if no time span
    if (end.getTime() - start.getTime() < 1) {
      throw new InvalidParamsException(`[policy ${policy._id}] Invalid time span (from ${s} to ${e})`);
    }

    console.debug(`[policy ${policy_id}] starting from ${s} to ${e}`);

    const batchSize = 50;
    const cursor = this.tripRepository.findTripByPolicy(policy, start, end, batchSize, override);
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
