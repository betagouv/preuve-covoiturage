import {
  command,
  CommandInterface,
  CommandOptionType,
  ContextType,
  KernelInterfaceResolver,
  ResultType,
} from '@ilos/common';
import { Timezone } from '@pdc/providers/validator';
import { castUserStringToUTC, toISOString } from '../helpers';
import { ParamsInterface, signature as finalize } from '@shared/policy/finalize.contract';

interface CommandOptions {
  from: string;
  to: string;
  tz: Timezone;
  resync: boolean;
  clear: boolean;
}

@command()
export class FinalizeCommand implements CommandInterface {
  static readonly signature: string = 'campaign:finalize';
  static readonly description: string = 'Finalize stateful campaign rules';
  static readonly options: CommandOptionType[] = [
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
      signature: '--resync',
      description: 'resync the max_amount_restriction keys to incentive_sum',
      default: false,
    },
    {
      signature: '--clear',
      description: 'clear dead locks',
      default: false,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(options: CommandOptions): Promise<ResultType> {
    try {
      const { tz, resync: sync_incentive_sum, clear } = options;
      const context: ContextType = { channel: { service: 'campaign' } };
      const params: ParamsInterface = { tz, sync_incentive_sum, clear };

      if ('from' in options && options.from) {
        const from = castUserStringToUTC(options.from, tz);
        if (from) params.from = toISOString(from);
      }

      if ('to' in options && options.to) {
        const to = castUserStringToUTC(options.to, tz);
        if (to) params.to = toISOString(to);
      }

      await this.kernel.call(finalize, params, context);

      return '';
    } catch (e) {
      console.error(e.rpcError?.data || e.message);
    }
  }
}
