import { isAfter } from 'date-fns';
import { handler, KernelInterfaceResolver, ContextType, InitHookInterface } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import {
  signature as handlerSignature,
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../shared/policy/apply.contract';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  TripRepositoryProviderInterfaceResolver,
  PolicyRepositoryProviderInterfaceResolver,
  StatelessIncentiveInterface,
} from '../interfaces';
import { Policy } from '~/engine/entities/Policy';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
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
    console.debug('[policies] stateless starting');
    if (!('policy_id' in params)) {
      await this.dispatch();
      return;
    }
    await this.processPolicy(params.policy_id, params.override_from);
    console.debug('[policies] stateless finished');
  }

  protected async dispatch(): Promise<void> {
    const policies = await this.policyRepository.findWhere({ status: 'active' });
    for (const policy of policies) {
      this.kernel.notify<ParamsInterface>(handlerSignature, { policy_id: policy._id }, this.context);
    }
  }

  protected async processPolicy(policy_id: number, override_from?: Date): Promise<void> {
    console.debug(`[policy ${policy_id}] starting`, { policy_id, override_from });

    // 1. Find policy
    const policy = await Policy.import(await this.policyRepository.find(policy_id));

    // benchmark
    const totalStart = new Date();
    let total = 0;
    let counter = 0;

    // 2. Start a cursor to find trips
    const batchSize = 50;
    const start = override_from ?? isAfter(override_from, policy.start_date) ? override_from : policy.start_date;
    const end = isAfter(policy.end_date, new Date()) ? new Date() : policy.end_date;
    const cursor = this.tripRepository.findTripByPolicy(policy, start, end, batchSize, !!override_from);
    let done = false;

    do {
      const start = new Date();
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
      const ms = new Date().getTime() - start.getTime();
      console.debug(
        `[policy ${policy._id}] ${counter} (${total}) trips done in ${ms}ms (${((counter / ms) * 1000).toFixed(
          3,
        )}/s)`,
      );
      total += counter;
      counter = 0;
    } while (!done);

    console.debug(`[policy ${policy_id}] finished - ${total} in ${new Date().getTime() - totalStart.getTime()}ms`);
  }
}
