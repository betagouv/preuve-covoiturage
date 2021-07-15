import { LoadExcelFileComponent } from './../actions/logic/LoadExcelFileComponent'
import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';

@command()
export class BuildExcelExportCommand implements CommandInterface {
  static readonly signature: string = 'trip:excel';
  static readonly description: string = 'Export an excel';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-t, --territory_id',
      description: 'Territory Id user scope',
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(id: string, options): Promise<void> {
    console.info('Stating export...');
    const laodExcelFileComponent: LoadExcelFileComponent = new LoadExcelFileComponent();
    await laodExcelFileComponent.call();
  }
}
