import { coerceDate } from '@ilos/cli';
import { CommandInterface, CommandOptionType, command } from '@ilos/common';
import { Timezone } from '@pdc/provider-validator';
import { ExportRepository, ExportType } from '../repositories/ExportRepository';

export type Options = {
  creator: number;
  type: ExportType;
  operator_id?: number | null;
  territory_id?: number | null;
  start?: Date;
  end?: Date;
  tz: Timezone;
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
      signature: '-t, --type <type>',
      description: 'Export type',
      default: ExportType.OPENDATA,
    },
    {
      signature: '-o, --operator_id <operator_id>',
      description: 'Operator id',
      default: null,
    },
    {
      signature: '-tt, --territory_id <territory_id>',
      description: 'Territory id',
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
  ];

  constructor(protected exportRepository: ExportRepository) {}

  public async call(options: Options): Promise<void> {
    // TODO
    const { creator, type, operator_id, territory_id, start, end, tz } = options;
    // TODO create ExportParams entity and pass it to the repository
    await this.exportRepository.create({
      created_by: creator,
      type,
      params,
    });
  }
}
