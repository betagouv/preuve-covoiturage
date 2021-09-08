import { handler, KernelInterfaceResolver, InitHookInterface } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  signature as handlerSignature,
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../shared/policy/finalize.contract';
import { PolicyEngine } from '../engine/PolicyEngine';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
export class FinalizeAction extends AbstractAction implements InitHookInterface {
  constructor(
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private engine: PolicyEngine,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(handlerSignature, null, {
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
    });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // Get last day of previous month
    const defaultTo = new Date();
    defaultTo.setDate(1);
    defaultTo.setHours(0, 0, 0, -1);

    const to = params.to ?? defaultTo;

    // Refresh table
    await this.tripRepository.refresh();

    // Update incentive on cancelled carpool
    await this.incentiveRepository.disableOnCanceledTrip();

    const policyMap: Map<number, ProcessableCampaign> = new Map();

    // Apply internal restriction of policies
    await this.processStatefulCampaigns(policyMap, params.to ?? to, params.from);

    // TODO: Apply external restriction (order) of policies

    // Lock all
    await this.incentiveRepository.lockAll(to);
  }

  protected async processStatefulCampaigns(
    policyMap: Map<number, ProcessableCampaign>,
    to: Date,
    from?: Date,
  ): Promise<void> {
    // 1. Start a cursor to find incentives
    const cursor = await this.incentiveRepository.findDraftIncentive(to, 100, from);
    let done = false;
    do {
      const updatedIncentives: { carpool_id: number; policy_id: number; amount: number }[] = [];
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const incentive of results.value) {
          // 2. Get policy
          const policyId = incentive.policy_id;
          if (!policyMap.has(policyId)) {
            policyMap.set(policyId, this.engine.buildCampaign(await this.campaignRepository.find(policyId)));
          }
          const policy = policyMap.get(policyId);

          // 3. Process stateful rule if needed
          if (policy.needStatefulApply()) {
            updatedIncentives.push(await this.engine.processStateful(policy, incentive));
          }
        }
      }
      // 4. Update incentives
      await this.incentiveRepository.updateManyAmount(updatedIncentives);
    } while (!done);
  }
}
