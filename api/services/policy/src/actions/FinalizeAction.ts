import { handler, KernelInterfaceResolver, InitHookInterface } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

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
import { Policy } from '~/engine/entities/Policy';
import { MetadataStore } from '~/engine/entities/MetadataStore';

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
              cron: '0 4 6 * *',
            },
            jobId: 'policy.finalize.cron',
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // Get last day of previous month
    const defaultTo = new Date();
    defaultTo.setDate(1);
    defaultTo.setHours(0, 0, 0, -1);

    const to = params.to ?? defaultTo;

    // Update incentive on cancelled carpool
    await this.incentiveRepository.disableOnCanceledTrip();

    const policyMap: Map<number, PolicyInterface> = new Map();

    // Apply internal restriction of policies
    console.debug(`START processing stateful policys`);
    await this.processStatefulpolicys(policyMap, to, params.from);
    console.debug(`DONE processing stateful policys`);

    // TODO: Apply external restriction (order) of policies

    // Lock all
    console.debug(`LOCK_ALL incentives to: ${to}`);
    await this.incentiveRepository.lockAll(to);
    console.debug('DONE locking');
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
      await this.incentiveRepository.updateStatefulAmount(updatedIncentives, IncentiveStatusEnum.Valitated);

      // 5. Persist meta
      await store.store(MetadataLifetime.Day);
      const duration = new Date().getTime() - start;
      console.debug(
        `Finalized ${updatedIncentives.length} incentives in ${duration}ms (${(
          (updatedIncentives.length / duration) *
          1000
        ).toFixed(3)}/s)`,
      );
    } while (!done);
  }
}
