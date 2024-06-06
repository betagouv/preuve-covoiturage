import { ContextType, handler, InvalidParamsException, NotFoundException } from '/ilos/common/index.ts';
import { Action as AbstractAction, env } from '/ilos/core/index.ts';
import { internalOnlyMiddlewares } from '/pdc/providers/middleware/index.ts';
import { isAfter, max, min } from 'date-fns';
import { Policy } from '../engine/entities/Policy.ts';
import { defaultTz, subDaysTz, today, toTzString } from '../helpers/index.ts';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  PolicyRepositoryProviderInterfaceResolver,
  StatelessIncentiveInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces/index.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/policy/apply.contract.ts';
import { alias } from '/shared/policy/apply.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class ApplyAction extends AbstractAction {
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
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (env.or_false('APP_DISABLE_POLICY_PROCESSING')) {
      return console.warn('[campaign:apply] policy processing is disabled by APP_DISABLE_POLICY_PROCESSING');
    }

    const { from, to, override } = this.defaultParams(params);
    console.info(`[campaign:apply] processing policy ${params.policy_id}`);
    await this.processPolicy(params.policy_id, from, to, override);
  }

  /**
   * Incentives are calculated for the last week (from -7 days til today).
   * Finalization will be applied until the last 5 days
   */
  protected defaultParams(params: ParamsInterface): Required<ParamsInterface> {
    const tz = params.tz ?? defaultTz;

    return {
      tz,
      policy_id: params.policy_id,
      from: params.from ?? subDaysTz(today(tz), 7),
      to: params.to ?? today(tz),
      override: !!params.override,
    };
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
    // handle date boundaries
    const start = max([from, policy.start_date]);
    const end = min([to, policy.end_date]);
    const s = toTzString(start);
    const e = toTzString(end);
    const pe = toTzString(policy.end_date);

    // throw if campaign start date is after policy end date
    if (isAfter(start, policy.end_date)) {
      throw new InvalidParamsException(`[policy ${policy._id}] 'from' (${s}) is after policy end_date (${pe})`);
    }

    // throw if no time span
    if (end.getTime() - start.getTime() < 1) {
      throw new InvalidParamsException(`[policy ${policy._id}] Invalid time span (from ${s} to ${e})`);
    }

    console.info(`[policy ${policy_id}] starting from ${s} to ${e}`);

    const batchSize = 1000;
    const cursor = this.tripRepository.findTripByPolicy(policy, start, end, batchSize, override);
    let done = false;

    do {
      if (total === 0) console.info(`[policy ${policy._id}] Fetching carpools...`);
      if (total === 0) console.time(`[policy ${policy._id}] Fetched carpools`);
      const incentives: Array<StatelessIncentiveInterface> = [];
      const results = await cursor.next();
      done = results.done;
      if (total === 0) console.timeEnd(`[policy ${policy._id}] Fetched carpools`);

      const bs = new Date(); // benchmark start
      if (results.value) {
        for (const carpool of results.value) {
          // 3. For each trip, process
          counter++;
          incentives.push(await policy.processStateless(carpool));
        }
      }

      // benchmark
      const ms = new Date().getTime() - bs.getTime();
      if (counter) {
        const rate = ((counter / ms) * 1000).toFixed(0);
        console.info(`[policy ${policy._id}] ${counter} (${total}) trips done in ${ms}ms (${rate}/s)`);
      }
      total += counter;
      counter = 0;

      // 4. Save incentives
      if (incentives.length) {
        const saveMsg = `[policy ${policy_id}] stored ${incentives.length} incentives`;
        console.time(saveMsg);
        await this.incentiveRepository.createOrUpdateMany(incentives.map((i) => i.export()));
        console.timeEnd(saveMsg);
      }
    } while (!done);

    console.info(`[policy ${policy_id}] finished - ${total} in ${new Date().getTime() - bench.getTime()}ms`);
  }
}
