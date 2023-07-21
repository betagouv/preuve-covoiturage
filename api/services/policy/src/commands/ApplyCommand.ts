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

interface CommandOptions {
  campaigns: number[];
  from: string;
  to: string;
  tz: Timezone;
  detach: boolean;
  override: boolean;
}

@command()
export class ApplyCommand implements CommandInterface {
  static readonly signature: string = 'campaign:apply';
  static readonly description: string = 'Apply stateless campaign rules';
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
      signature: '-d, --detach',
      description: 'detach execution to background jobs',
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
        const params: { policy_id: number } & Partial<CommandOptions> = { policy_id, tz, override };

        if ('from' in options && options.from) {
          const from = castUserStringToUTC(options.from, tz);
          if (from) params.from = toISOString(from);
        }

        if ('to' in options && options.to) {
          const to = castUserStringToUTC(options.to, tz);
          if (to) params.to = toISOString(to);
        }

        // warn the user if 'override' and 'to' are used together
        // as the processed finalized incentives might affect the result
        // of further incentives.
        if (params.override && params.to) {
          // eslint-disable-next-line prettier/prettier,max-len
          console.warn('[campaign:apply] Be careful when re-processing incentives with the --override option in conjunction with a --to end date. Further incentives will have to be re-processed and finalized too.');
        }

        // call the action
        if (options.detach) {
          console.info(`[campaign:apply] run policy ${policy_id} in detached mode`);
          await this.kernel.notify(apply, params, context);
        } else {
          try {
            await this.kernel.call(apply, params, context);
          } catch (e) {
            console.error(e.message, { params });
          }
        }
      }

      return '';
    } catch (e) {
      console.error(e.rpcError?.data || e.message);
    }
  }
}
