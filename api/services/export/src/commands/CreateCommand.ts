import { coerceDate } from '@ilos/cli';
import { CommandInterface, CommandOptionType, command } from '@ilos/common';
import { Timezone } from '@pdc/provider-validator';
import { ExportRepository, ExportType } from '../repositories/ExportRepository';

export type Options = {
  creator: number;
  operator_id?: number | null;
  territory_id?: number | null;
  geo?: string | null;
  start?: Date;
  end?: Date;
  tz: Timezone;
  sensitive: boolean;
};

@command()
export class CreateCommand implements CommandInterface {
  static readonly signature: string = 'export:create';
  static readonly description: string = 'Create an export request';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-c, --creator <creator>',
      description: 'User id',
    },
    {
      signature: '-o, --operator_id <operator_id>',
      description: 'Operator id',
      default: null,
    },
    {
      signature: '-t, --territory <territory_id>',
      description: 'Territory id',
      default: null,
    },
    {
      signature: '-g --geo <geo>',
      description: 'Geo selector <type>:<code> (types: aom, com, epci, dep, reg)',
      default: null,
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
      default: null,
      coerce: coerceDate,
    },
    {
      signature: '--tz <tz>',
      description: 'Output timezone',
      default: 'Europe/Paris',
    },
    {
      signature: '--sensitive',
      description: 'Export sensitive fields',
      default: false,
    },
  ];

  constructor(protected exportRepository: ExportRepository) {}

  public async call(options: Options): Promise<void> {
    // TODO
    const { creator, operator_id, territory_id, start, end, tz, sensitive } = options;
    const params = {
      start_at: start,
      end_at: end,
      operator_id: Array.isArray(operator_id) ? operator_id : [operator_id],
      tz,
    };

    // TODO resolve geo_selector from --territory_id and --geo

    // TODO create ExportParams entity and pass it to the repository
    await this.exportRepository.create({
      created_by: creator,
      type: sensitive ? ExportType.OPERATOR : ExportType.OPENDATA,
      params,
    });
  }
}
