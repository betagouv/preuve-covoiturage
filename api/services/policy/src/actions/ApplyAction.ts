import { handler, KernelInterfaceResolver, ContextType, InitHookInterface } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  signature as handlerSignature,
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from '../shared/policy/apply.contract';
import { PolicyEngine } from '../engine/PolicyEngine';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces';

@handler({ ...handlerConfig, middlewares: [['channel.service.only', [handlerConfig.service]]] })
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
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private engine: PolicyEngine,
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
    if (!('campaign_id' in params)) {
      await this.refreshAndDispatch();
      return;
    }
    await this.processCampaign(params.campaign_id);
  }

  protected async refreshAndDispatch(): Promise<void> {
    await this.tripRepository.refresh();
    const campaignIds = await this.tripRepository.listApplicablePoliciesId();
    for (const campaign_id of campaignIds) {
      this.kernel.notify<ParamsInterface>(handlerSignature, { campaign_id }, this.context);
    }
  }

  protected async processCampaign(campaign_id: number): Promise<void> {
    // 1. Find campaign and start engine
    const campaign = this.engine.buildCampaign(await this.campaignRepository.find(campaign_id));

    // 2. Start a cursor to find trips
    const cursor = await this.tripRepository.findTripByPolicy(campaign_id);
    let done = false;
    do {
      const incentives: IncentiveInterface[] = [];
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const trip of results.value) {
          // 3. For each trip, process
          incentives.push(...(await this.engine.processStateless(campaign, trip)));
        }
      }
      // 4. Save incentives
      await this.incentiveRepository.createOrUpdateMany(incentives);
    } while (!done);
  }
}
