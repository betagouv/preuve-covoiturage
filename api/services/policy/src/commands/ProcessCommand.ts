import {
  command,
  CommandInterface,
  CommandOptionType,
  ContextType,
  KernelInterfaceResolver,
  ResultType,
} from '@ilos/common';
import { Timezone } from '@pdc/provider-validator';
import { castUserStringToUTC, toISOString } from '../helpers';
import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import { signature as apply } from '../shared/policy/apply.contract';
import { signature as finalize } from '../shared/policy/finalize.contract';

interface CommandOptions {
  campaigns: number[];
  from: string;
  to: string;
  tz: Timezone;
  finalize: boolean;
  detach: boolean;
  resync: boolean;
  override: boolean;
}

@command()
export class ProcessCommand implements CommandInterface {
  static readonly signature: string = 'campaign:process';
  static readonly description: string = 'Process campaign rules';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-c, --campaigns <campaigns>',
      description: 'list of campaign_id',
      default: [],
      coerce(s: string): number[] {
        return s
          .split(',')
          .map((i: string): number => parseInt(s))
          .filter((i: number): boolean => !!i);
      },
    },
    {
      signature: '-f, --from <from>',
      description: 'from date <YYYY-MM-DD>',
    },
    {
      signature: '-t, --to <to>',
      description: 'to date <YYYY-MM-DD>',
    },
    {
      signature: '--tz <tz>',
      description: 'timezone',
      default: 'Europe/Paris',
    },
    {
      signature: '-f, --finalize',
      description: 'finalize incentive calculations depending on context. (applies to ALL campaigns)',
      default: false,
    },
    {
      signature: '-d, --detach',
      description: 'detach execution to background jobs',
      default: false,
    },
    {
      signature: '--resync',
      description: 'resync the max_amount_restriction keys to incentive_sum',
      default: false,
    },
    {
      signature: '--override',
      description: 'override existing incentives',
      default: false,
    },
  ];

  constructor(
    protected kernel: KernelInterfaceResolver,
    private policyRepository: PolicyRepositoryProviderInterfaceResolver,
  ) {}

  public async call(options: CommandOptions): Promise<ResultType> {
    try {
      const { tz, override } = options;

      // list campaigns
      const campaigns = options.campaigns.length
        ? options.campaigns
        : (await this.policyRepository.findWhere({ status: 'active' })).map((c) => c._id);

      for (const policy_id of campaigns) {
        const context: ContextType = { channel: { service: 'campaign' } };

        // configure params to pass schema validation
        const params: Record<string, any> = { policy_id, tz, override };

        if ('from' in options && options.from) {
          const from = castUserStringToUTC(options.from, tz);
          params.from = from ? toISOString(from) : undefined;
        }

        if ('to' in options && options.to) {
          const to = castUserStringToUTC(options.to, tz);
          params.to = to ? toISOString(to) : undefined;
        }

        // warn the user if 'override' and 'to' are used together
        // as the processed finalized incentives might affect the result
        // of further incentives.
        if (params.override && params.to) {
          // eslint-disable-next-line prettier/prettier,max-len
        console.warn('[campaign:process] Be careful when re-processing incentives with the --override option in conjunction with a --to end date. Further incentives will have to be re-processed and finalized too.');
        }

        // call the action
        if (options.detach) {
          console.info(`[campaign:process] run policy ${policy_id} in detached mode`);
          await this.kernel.notify(apply, params, context);
        } else {
          await this.kernel.call(apply, params, context);
        }

        // finalize processed incentives once all campaigns are done
        // works only in sync mode.
        if (options.finalize) {
          if (options.detach) {
            return console.warn(`[campaign:process] --detach cannot be used with --finalize`);
          }

          console.info(`[campaign:process] finalize all campaigns`);
          const finalizeParams: Record<string, any> = { tz: params.tz, sync_incentive_sum: options.resync };
          if (params.to) finalizeParams.to = params.to;
          if (params.from) finalizeParams.from = params.from;
          await this.kernel.call(finalize, finalizeParams, context);
        }
      }

      return '';
    } catch (e) {
      console.error(e.rpcError?.data || e.message);
    }
  }
}
