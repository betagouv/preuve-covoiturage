import { coerceDate } from '@ilos/cli';
import { CommandInterface, CommandOptionType, command } from '@ilos/common';
import { Timezone } from '@pdc/provider-validator';
import { ExportParams } from '../models/ExportParams';
import { ExportRepositoryInterfaceResolver, ExportType } from '../repositories/ExportRepository';
import { TerritoryServiceInterfaceResolver } from '../services/TerritoryService';

export type Options = {
  creator: number;
  operator_id?: number[];
  territory_id?: number[];
  geo?: string[];
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
      default: 0,
    },
    {
      signature: '-o, --operator_id <operator_id...>',
      description: '[repeatable] Operator id',
      default: [],
    },
    // {
    //   signature: '-t, --territory <territory_id...>',
    //   description: '[repeatable] Territory id',
    //   default: [],
    // },
    {
      signature: '-g --geo <geo...>',
      description: '[repeatable] Geo selector <type>:<code> (types: aom, com, epci, dep, reg)',
      default: [],
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

  constructor(
    protected exportRepository: ExportRepositoryInterfaceResolver,
    protected territoryService: TerritoryServiceInterfaceResolver,
  ) {}

  public async call(options: Options): Promise<void> {
    const { creator, operator_id, geo, start, end, tz, sensitive } = options;
    const { uuid, type, status, params } = await this.exportRepository.create({
      created_by: creator,
      type: sensitive ? ExportType.OPERATOR : ExportType.OPENDATA,
      params: new ExportParams({
        start_at: start,
        end_at: end,
        operator_id: Array.isArray(operator_id) ? operator_id : [operator_id],
        // TODO add support for the territory_id (territory_group._id)
        // TODO add support for the SIREN to select the territory
        geo_selector: await this.territoryService.resolve({ geo }),
        tz,
      }),
    });

    console.info(`Export request created!
      UUID: ${uuid}
      Type: ${type}
      Status: ${status}
      From: ${params.get().start_at} to ${params.get().end_at}
    `);
  }
}
