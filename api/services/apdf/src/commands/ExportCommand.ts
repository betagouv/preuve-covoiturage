import { coerceDate, coerceIntList } from '@ilos/cli';
import { command, CommandInterface, CommandOptionType, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { zonedTimeToUtc } from 'date-fns-tz';
import { set } from 'lodash';
import { signature as exportSignature } from '../shared/apdf/export.contract';
import {
  ParamsInterface as ListCampaignsParams,
  ResultInterface as ListCampaignsResults,
  signature as listCampaignsSignature,
} from '../shared/policy/list.contract';

interface Options {
  campaigns: number[];
  start?: Date;
  end?: Date;
  operators?: number[];
  tz: string;
  verbose: boolean;
  sync: boolean;
}

@command()
export class ExportCommand implements CommandInterface {
  static readonly signature: string = 'apdf:export';
  static readonly description: string = 'Export APDF';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-c, --campaigns <campaigns>',
      description: 'List of campaign/policy id separated by ,',
      coerce: coerceIntList,
      default: [],
    },
    {
      signature: '-o, --operators <operators>',
      description: 'List of operators id separated by ,',
      coerce: coerceIntList,
    },
    {
      signature: '-s, --start <start>',
      description: 'Start date (YYYY-MM-DD)',
      default: null,
      coerce: coerceDate,
    },
    {
      signature: '-e, --end <end>',
      description: 'End date (YYYY-MM-DD)',
      coerce: coerceDate,
    },
    {
      signature: '--tz <tz>',
      description: 'Output timezone',
      default: 'Europe/Paris',
    },
    {
      signature: '--verbose',
      description: 'Display CLI specific console.info()',
    },
    {
      signature: '--sync',
      description: 'Run the export without the queue',
    },
  ];

  constructor(private kernel: KernelInterfaceResolver) {}

  public async call(options: Options): Promise<string> {
    const campaign_id = options.campaigns.length ? options.campaigns : await this.findActiveCampaigns();

    const params = {
      format: { tz: options.tz },
      query: { campaign_id },
    };

    const context: ContextType = {
      channel: { service: 'apdf', transport: 'cli' },
      call: { user: { permissions: ['registry.apdf.export'] }, metadata: { verbose: options.verbose } },
    };

    if (options.start) set(params, 'query.date.start', zonedTimeToUtc(options.start, options.tz).toISOString());
    if (options.end) set(params, 'query.date.end', zonedTimeToUtc(options.end, options.tz).toISOString());
    if (options.operators?.length) set(params, 'query.operator_id', options.operators);

    if (options.sync) {
      console.info(`Running [${exportSignature}] in sync`);
      await this.kernel.call(exportSignature, params, context);
    } else {
      console.info(`Pushed [${exportSignature}] to the queue for background execution`);
      await this.kernel.notify(exportSignature, params, context);
    }

    return '';
  }

  private async findActiveCampaigns(): Promise<number[]> {
    const params: ListCampaignsParams = { status: 'active' };

    return (
      await this.kernel.call<ListCampaignsParams, ListCampaignsResults>(listCampaignsSignature, params, {
        channel: { service: 'apdf' },
        call: { user: { permissions: ['common.policy.list'] } },
      })
    ).map((c) => c._id);
  }
}
