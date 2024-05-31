import { coerceIntList } from '@ilos/cli/index.ts';
import { CommandInterface, CommandOptionType, ContextType, KernelInterfaceResolver, command } from '@ilos/common/index.ts';
import { ParamsInterface as ExportParams, signature as exportSignature } from '@shared/apdf/export.contract.ts';
import {
  ResultInterface as ListCampaignsResults,
  signature as listCampaignsSignature,
} from '@shared/policy/list.contract.ts';
import { fromZonedTime } from 'date-fns-tz';
import { set } from 'lodash';
import { castExportParams } from '../helpers/castExportParams.helper.ts';

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
    const params: Partial<ExportParams> = {
      format: { tz: options.tz },
    };

    const context: ContextType = {
      channel: { service: 'apdf', transport: 'cli' },
      call: { user: { permissions: ['registry.apdf.export'] }, metadata: { verbose: options.verbose } },
    };

    if (options.start) set(params, 'query.date.start', fromZonedTime(options.start, options.tz).toISOString());
    if (options.end) set(params, 'query.date.end', fromZonedTime(options.end, options.tz).toISOString());
    if (options.operators?.length) set(params, 'query.operator_id', options.operators);

    // fetch active campaigns at the given date
    const { start_date, end_date } = castExportParams(params as ExportParams);
    const campaign_list = options.campaigns.length
      ? options.campaigns
      : await this.findActiveCampaigns(start_date.toISOString());
    set(params, 'query.campaign_id', campaign_list);

    // eslint-disable-next-line max-len,prettier/prettier
    console.info(`Running [${exportSignature}] from ${start_date.toISOString()} to ${end_date.toISOString()} for campaigns: ${campaign_list.join(', ')}`);
    // eslint-enable

    await this.kernel.call(exportSignature, params, context);

    return '';
  }

  private async findActiveCampaigns(datetime: String): Promise<number[]> {
    const params = { datetime };

    return (
      await this.kernel.call<{ datetime: String }, ListCampaignsResults>(listCampaignsSignature, params, {
        channel: { service: 'apdf' },
        call: { user: { permissions: ['common.policy.list'] } },
      })
    ).map((c) => c._id);
  }
}
