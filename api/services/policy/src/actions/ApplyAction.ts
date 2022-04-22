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
import { PolicyEngine } from '../engine/PolicyEngine';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces';

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
      await this.dispatch();
      return;
    }
    await this.processCampaign(params.campaign_id, params.override_from);
  }

  protected async dispatch(): Promise<void> {
    const campaignIds = await this.tripRepository.listApplicablePoliciesId();
    for (const campaign_id of campaignIds) {
      this.kernel.notify<ParamsInterface>(handlerSignature, { campaign_id }, this.context);
    }
  }

  protected async processCampaign(campaign_id: number, override_from?: Date): Promise<void> {
    console.debug('PROCESS CAMPAIGN', { campaign_id, override_from });

    // 1. Find campaign and start engine
    const campaign = this.engine.buildCampaign(await this.campaignRepository.find(campaign_id));

    // benchmark
    const totalStart = new Date();
    let total = 0;
    let counter = 0;

    // 2. Start a cursor to find trips
    const batchSize = 50;
    const start = override_from ?? isAfter(override_from, campaign.start_date) ? override_from : campaign.start_date;
    const end = isAfter(campaign.end_date, new Date()) ? new Date() : campaign.end_date;
    const cursor = this.tripRepository.findTripByPolicy(campaign, start, end, batchSize, !!override_from);
    let done = false;

    do {
      const start = new Date();
      const incentives: IncentiveInterface[] = [];
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const trip of results.value) {
          // skip trip if campaign is finished
          if (campaign.end_date < trip.datetime) continue;

          // 3. For each trip, process
          counter++;
          incentives.push(...(await this.engine.processStateless(campaign, trip)));
        }
      }

      // 4. Save incentives
      console.debug(`STORE ${incentives.length} incentives`);
      await this.incentiveRepository.createOrUpdateMany(incentives);

      // benchmark
      const ms = new Date().getTime() - start.getTime();
      console.debug(
        `[campaign ${campaign.policy_id}] ${counter} (${total}) trips done in ${ms}ms (${(
          (counter / ms) *
          1000
        ).toFixed(3)}/s)`,
      );
      total += counter;
      counter = 0;
    } while (!done);

    console.debug(`TOTAL ${total} in ${new Date().getTime() - totalStart.getTime()}ms`);
  }
}
