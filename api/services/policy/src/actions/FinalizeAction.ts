import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { MetadataStore } from '../engine/entities/MetadataStore';
import { Policy } from '../engine/entities/Policy';
import { defaultTz, subDaysTz, today, toTzString } from '../helpers/dates.helper';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveStatusEnum,
  MetadataLifetime,
  MetadataRepositoryProviderInterfaceResolver,
  PolicyInterface,
  PolicyRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/finalize.contract';
import { alias } from '../shared/policy/finalize.schema';
import { signature as syncincentivesumSignature } from '../shared/policy/syncIncentiveSum.contract';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]] })
export class FinalizeAction extends AbstractAction {
  constructor(
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private metaRepository: MetadataRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!!env('APP_DISABLE_POLICY_PROCESSING', false)) {
      return;
    }

    const hasLock = await this.policyRepository.getLock();
    if (!hasLock) {
      console.debug('[policies] stateful already processing');
      return;
    }

    console.time('[policies] stateful');
    const { from, to, sync_incentive_sum } = this.defaultParams(params);

    // resync incentive_sum for all policies
    // call the action instead of the repo to avoid having
    // to duplicate the listing of all campaigns
    if (sync_incentive_sum) {
      await this.kernel.call(syncincentivesumSignature, {}, { channel: { service: handlerConfig.service } });
    }

    // Update incentive on canceled carpool
    await this.incentiveRepository.disableOnCanceledTrip();

    const policyMap: Map<number, PolicyInterface> = new Map();

    try {
      // eslint-disable-next-line prettier/prettier,max-len
      console.debug(`[policies] stateful starting from ${from ? toTzString(from) : 'start'} until ${to ? toTzString(to) : 'now' }`);
      await this.processStatefulPolicies(policyMap, to, from);
      console.debug('[policies] stateful finished');

      // Lock all
      console.debug(`[policies] lock all incentive until ${toTzString(to)}`);
      await this.incentiveRepository.lockAll(to);
      console.debug('[policies] lock finished');

      // Release the lock
      await this.policyRepository.releaseLock({ from_date: from, to_date: to });
    } catch (e) {
      console.debug(`[policies:failure] unlock all incentive until ${toTzString(to)}`);
      await this.incentiveRepository.lockAll(to, true);
      console.debug('[policies:failure] unlock finished');

      // Release the lock
      await this.policyRepository.releaseLock({ from_date: from, to_date: to, error: e });
      throw e;
    } finally {
      // Release the lock ?
      console.timeEnd('[policies] stateful');
    }
  }

  /**
   * Trips are finalized until 5 days ago to make sure the data is sent by the operators
   * and make sure the trips are finalized before APDF are generated on the 6th of every month
   */
  protected defaultParams(params: ParamsInterface): Required<ParamsInterface> {
    const tz = params.tz ?? defaultTz;

    return {
      tz,
      from: params.from ?? subDaysTz(today(tz), 15),
      to: params.to ?? subDaysTz(today(tz), 5),
      sync_incentive_sum: !!params.sync_incentive_sum,
    };
  }

  protected async processStatefulPolicies(
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
      const bench = new Date().getTime();
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
      const duration = new Date().getTime() - bench;
      console.debug(
        `[policies] stateful incentive processing ${updatedIncentives.length} incentives done in ${duration}ms (${(
          (updatedIncentives.length / duration) *
          1000
        ).toFixed(3)}/s)`,
      );
    } while (!done);

    // 5. Persist meta
    console.debug('[policies] store metadata');
    await store.store(MetadataLifetime.Day);
    console.debug('[policies] store metadata done');
  }
}
