import { command, CommandInterface, CommandOptionType } from '@/ilos/common/index.ts';
import { ExportTarget } from '../models/Export.ts';
import { ExportParams } from '../models/ExportParams.ts';
import { XLSXWriter } from '../models/XLSXWriter.ts';
import { BuildServiceInterfaceResolver } from '../services/BuildService.ts';
import { FieldServiceInterfaceResolver } from '../services/FieldService.ts';
import { NameServiceInterfaceResolver } from '../services/NameService.ts';

@command()
export class DebugCommand implements CommandInterface {
  static readonly signature: string = 'export:debug';
  static readonly description: string = 'Test and debug the export service';
  static readonly options: CommandOptionType[] = [
    // TODO add options to define the user email, the target of the export, the date range, etc.
  ];

  constructor(
    private build: BuildServiceInterfaceResolver,
    private field: FieldServiceInterfaceResolver,
    private name: NameServiceInterfaceResolver,
  ) {}

  public async call(): Promise<void> {
    const fields = this.field.byTarget(ExportTarget.OPERATOR);
    const start_at = new Date('2023-08-14T08:00:00+0200');
    const end_at = new Date('2023-08-14T10:00:00+0200');
    const filename = this.name.get({ target: ExportTarget.OPERATOR });

    // TODO normalise params
    // TODO create ExportFile entity and pass it to the provider
    // TODO get the file name from the config as done in APDFNameProvider
    // create the Workbook and write data
    await this.build.write(new ExportParams({ start_at, end_at }), new XLSXWriter(filename, { fields }));

    // TODO upload
    // TODO cleanup
  }
}
