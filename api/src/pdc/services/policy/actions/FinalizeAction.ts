import { ConfigInterfaceResolver, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/providers/middleware';
import { MetadataStore } from '../engine/entities/MetadataStore';
import { Policy } from '../engine/entities/Policy';
import { castUserStringToUTC, defaultTz, subDaysTz, today, toISOString, toTzString } from '../helpers';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveStatusEnum,
  MetadataLifetime,
  MetadataRepositoryProviderInterfaceResolver,
  PolicyInterface,
  PolicyRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/policy/finalize.contract';
import { alias } from '@shared/policy/finalize.schema';
import { signature as syncincentivesumSignature } from '@shared/policy/syncIncentiveSum.contract';

// TOFIX ?
// from and to props must be strings to pass schema validation
// we need Dates in the code.
type DefaultParamsInterface = Omit<Required<ParamsInterface>, 'from' | 'to'> & { from: Date; to: Date };
@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]] })
export class FinalizeAction extends AbstractAction {
  constructor(
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private metaRepository: MetadataRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (env.or_false('APP_DISABLE_POLICY_PROCESSING')) {
      return console.warn('[campaign:finalize] policy processing is disabled by APP_DISABLE_POLICY_PROCESSING');
    }

    console.time('[campaign:finalize] stateful');
    const { from, to, sync_incentive_sum, clear } = await this.defaultParams(params);

    // clear dead locks prior to finalization (meant to be used manually, not in CRON)
    if (clear) {
      await this.policyRepository.clearDeadLocks();
    }

    // create a lock to avoid parallel processing
    const lock = await this.policyRepository.getLock();
    if (!lock) {
      return console.warn('[campaign:finalize] stateful already processing');
    }

    console.info(`[campaign:finalize] Acquired lock #${lock._id} at ${toISOString(lock.started_at)}`);

    // resync incentive_sum for all policies
    // call the action instead of the repo to avoid having
    // to duplicate the listing of all campaigns
    if (sync_incentive_sum) {
      console.info('[campaign:finalize] syncIncentiveSum');
      await this.kernel.call(syncincentivesumSignature, {}, { channel: { service: handlerConfig.service } });
    }

    const policyMap: Map<number, PolicyInterface> = new Map();

    const timespan = 6 * 3600000; // N hours in milliseconds
    let currentTime = from.getTime();
    const endTime = to.getTime();

    while (currentTime <= endTime) {
      const currentFrom = new Date(currentTime);
      const currentTo = new Date(currentTime + timespan);

      try {
        // Update incentive on canceled carpool
        console.time('[campaign:finalize] disableOnCanceledTrip');
        await this.incentiveRepository.disableOnCanceledTrip(currentFrom, currentTo);
        console.timeEnd('[campaign:finalize] disableOnCanceledTrip');

        // eslint-disable-next-line prettier/prettier,max-len
        console.info(`[campaign:finalize] stateful starting from ${toTzString(currentFrom)} until ${toTzString(currentTo)}`);
        await this.processStatefulPolicies(policyMap, currentTo, currentFrom);
        console.debug('[campaign:finalize] stateful finished');

        // Lock all
        console.debug(`[campaign:finalize] set status on incentives`);
        await this.incentiveRepository.setStatus(currentFrom, currentTo);
        console.debug('[campaign:finalize] lock finished');

        // Release the lock
        await this.policyRepository.releaseLock({ from_date: currentFrom, to_date: currentTo });
      } catch (e) {
        console.debug(`[campaign:finalize] unlock all incentive until ${toTzString(currentTo)} in catch block`);
        await this.incentiveRepository.setStatus(currentFrom, currentTo, true);
        console.debug('[campaign:finalize] unlock finished in catch block');

        // Release the lock
        await this.policyRepository.releaseLock({ from_date: currentFrom, to_date: currentTo, error: e });
        throw e;
      }

      currentTime += timespan; // move to the next hour
    }

    console.timeEnd('[campaign:finalize] stateful');
  }

  /**
   * Trips are finalized until 5 days ago to make sure the data is sent by the operators
   * and make sure the trips are finalized before APDF are generated on the 6th of every month
   */
  protected async defaultParams(params: ParamsInterface): Promise<DefaultParamsInterface> {
    const tz = params.tz ?? defaultTz;
    const to = castUserStringToUTC(params.to) || subDaysTz(today(tz), this.config.get('policies.finalize.to'));
    const from =
      castUserStringToUTC(params.from) ||
      (await this.incentiveRepository.latestDraft()) ||
      subDaysTz(today(tz), this.config.get('policies.finalize.from'));

    return { tz, from, to, sync_incentive_sum: !!params.sync_incentive_sum, clear: !!params.clear };
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
      const len = updatedIncentives.length;
      const rate = ((len / duration) * 1000).toFixed(3);
      console.debug(`[campaign:finalize] ${len} incentives done in ${duration}ms (${rate}/s)`);
    } while (!done);

    // 5. Persist meta
    console.debug('[campaign:finalize] store metadata');
    await store.store(MetadataLifetime.Day);
    console.debug('[campaign:finalize] store metadata done');
  }
}
