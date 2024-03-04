import { coerceIntList } from '@ilos/cli';
import { CommandInterface, CommandOptionType, ContextType, KernelInterfaceResolver, command } from '@ilos/common';
import { ParamsInterface as ExportParams, signature as exportSignature } from '@shared/apdf/export.contract';
import {
  ParamsInterface as ListCampaignsParams,
  ResultInterface as ListCampaignsResults,
  signature as listCampaignsSignature,
} from '@shared/policy/list.contract';
import { zonedTimeToUtc } from 'date-fns-tz';
import { set } from 'lodash';

interface Options {
  campaigns: number[];
  start?: string;
  end?: string;
  operators?: number[];
  tz: string;
  verbose: boolean;
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
    },
    {
      signature: '-e, --end <end>',
      description: 'End date (YYYY-MM-DD)',
      default: null,
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
  ];

  constructor(private kernel: KernelInterfaceResolver) {}

  public async call(options: Options): Promise<string> {
    const campaign_id = options.campaigns.length ? options.campaigns : await this.findActiveCampaigns();

    const params: ExportParams = {
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

    console.info(`Running [${exportSignature}]`);
    await this.kernel.call(exportSignature, params, context);

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
