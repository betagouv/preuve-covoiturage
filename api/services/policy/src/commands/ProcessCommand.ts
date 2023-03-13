import {
  command,
  CommandInterface,
  CommandOptionType,
  ContextType,
  KernelInterfaceResolver,
  ResultType,
} from '@ilos/common';
import { Timezone } from '@pdc/provider-validator';
import { castUserStringToUTC, toISOString } from '../helpers/dates.helper';
import { signature } from '../shared/policy/apply.contract';

interface CommandOptions {
  campaign: number;
  from: string;
  to: string;
  tz: Timezone;
  finalize: boolean;
  detach: boolean;
  override: boolean;
}

@command()
export class ProcessCommand implements CommandInterface {
  static readonly signature: string = 'campaign:process';
  static readonly description: string = 'Process campaign rules';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-c, --campaign <campaign_id>',
      description: 'campaign_id',
      coerce(i: string): number {
        return Number(i);
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
      signature: '--override',
      description: 'override existing incentives',
      default: false,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(options: CommandOptions): Promise<ResultType> {
    const { campaign: policy_id, tz, finalize, override } = options;

    const context: ContextType = { channel: { service: 'campaign' } };

    // configure params to pass schema validation
    const params: Record<string, any> = { policy_id, tz, finalize, override };

    if ('from' in options && options.from) {
      params.from = toISOString(castUserStringToUTC(options.from, tz));
    }

    if ('to' in options && options.to) {
      params.to = toISOString(castUserStringToUTC(options.to, tz));
    }

    // call the action
    if (options.detach) {
      console.info(`[campaign:process] run in detached mode`);
      await this.kernel.notify(signature, params, context);
    } else {
      await this.kernel.call(signature, params, context);
    }

    return '';
  }
}
