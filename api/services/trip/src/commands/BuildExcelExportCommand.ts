import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';
import {
  ParamsInterface as BuilExcelExportActionInterface,
  ResultInterface as BuilExcelExportActionInterfaceResultInterface,
  signature as buildExcelEportSignature,
} from '../shared/trip/buildExcelExport.contract';

@command()
export class BuildExcelExportCommand implements CommandInterface {
  static readonly signature: string = 'trip:excel';
  static readonly description: string = 'Export an excel';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-c, --campaign_id <campaign_id>',
      description: 'Campaign id to make te export for',
    },
    {
      signature: '-t, --territory_id <territory_id>',
      description: 'Territory Id user scope',
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(options: { territory_id: number; campaign_id: number }): Promise<void> {
    const { territory_id, campaign_id } = options;
    const builExcelExportActionInterface: BuilExcelExportActionInterface = {
      query: { campaign_id: [campaign_id] },
      format: { tz: 'Europe/Paris' },
    };
    await this.kernel.call<BuilExcelExportActionInterface, BuilExcelExportActionInterfaceResultInterface>(
      buildExcelEportSignature,
      builExcelExportActionInterface,
      { channel: { service: buildExcelEportSignature } },
    );
  }
}
