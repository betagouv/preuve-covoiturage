import { handler, KernelInterfaceResolver, InitHookInterface } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';
import { sub } from 'date-fns';

import {
  signature as handlerSignature,
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../shared/policy/finalize.contract';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  MetadataRepositoryProviderInterfaceResolver,
  PolicyRepositoryProviderInterfaceResolver,
  IncentiveStatusEnum,
  MetadataLifetime,
  PolicyInterface,
} from '../interfaces';
import { Policy } from '../engine/entities/Policy';
import { MetadataStore } from '../engine/entities/MetadataStore';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
export class FinalizeAction extends AbstractAction implements InitHookInterface {
  constructor(
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private metaRepository: MetadataRepositoryProviderInterfaceResolver,
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
              cron: '0 4 * * *',
            },
            jobId: 'policy.finalize.cron',
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_POLICY_PROCESSING', false)) {
      return;
    }
    console.time('[policies] stateful');
    // Get 7 days ago
    const to = params.to ?? sub(new Date(), { days: 7 });

    // Update incentive on cancelled carpool
    await this.incentiveRepository.disableOnCanceledTrip();

    const policyMap: Map<number, PolicyInterface> = new Map();

    try {
      console.debug('[policies] stateful starting');
      await this.processStatefulpolicys(policyMap, to, params.from);
      console.debug('[policies] stateful finished');
      // Lock all
      console.debug(`[policies] lock all incentive until ${to}`);
      await this.incentiveRepository.lockAll(to);
      console.debug('[policies] lock finished');
    } catch (e) {
      console.debug(`[policies:failure] unlock all incentive until ${to}`);
      await this.incentiveRepository.lockAll(to, true);
      console.debug('[policies:failure] unlock finished');
      throw e;
    } finally {
      console.timeEnd('[policies] stateful');
    }
  }

  protected async processStatefulpolicys(
    policyMap: Map<number, PolicyInterface>,
    to: Date,
    from?: Date,
  ): Promise<void> {
    // 0. Instanciate a meta store
    const store = new MetadataStore(this.metaRepository);
    // 1. Start a cursor to find incentives
    const cursor = this.incentiveRepository.findDraftIncentive(to, 100, from);
    let done = false;
    do {
      const start = new Date().getTime();

      const updatedIncentives = [];
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const incentive of results.value) {
          // 2. Get policy
          const policyId = incentive.policy_id;
          if (!policyMap.has(policyId)) {
            policyMap.set(policyId, await Policy.import(await this.policyRepository.find(policyId)));
          }
          const policy = policyMap.get(policyId);

          // 3. Process stateful rule
          updatedIncentives.push(await policy.processStateful(store, incentive));
        }
      }
      // 4. Update incentives
      await this.incentiveRepository.updateStatefulAmount(updatedIncentives, IncentiveStatusEnum.Pending);
      const duration = new Date().getTime() - start;
      console.debug(
        `[policies] stateful incentive processing ${updatedIncentives.length} incentives done in ${duration}ms (${(
          (updatedIncentives.length / duration) *
          1000
        ).toFixed(3)}/s)`,
      );
    } while (!done);

    console.debug('[policies] store metadata');
    // 5. Persist meta
    await store.store(MetadataLifetime.Day);
    console.debug('[policies] store metadata done');
  }
}
