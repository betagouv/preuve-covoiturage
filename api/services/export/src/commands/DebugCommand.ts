import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { ExportParams } from '../models/ExportParams';
import { XLSXWriter } from '../models/XLSXWriter';
import { ExportType } from '../repositories/ExportRepository';
import { BuildServiceInterfaceResolver } from '../services/BuildService';
import { FieldServiceInterfaceResolver } from '../services/FieldService';

@command()
export class DebugCommand implements CommandInterface {
  static readonly signature: string = 'export:debug';
  static readonly description: string = 'Test and debug the export service';
  static readonly options: CommandOptionType[] = [
    // TODO add options to define the user email, the type of export, the date range, etc.
  ];

  constructor(
    private build: BuildServiceInterfaceResolver,
    private field: FieldServiceInterfaceResolver,
  ) {}

  public async call(): Promise<void> {
    const fields = this.field.byType(ExportType.OPERATOR);

    // TODO normalise params
    // TODO create ExportFile entity and pass it to the provider
    // TODO get the file name from the config as done in APDFNameProvider
    // create the Workbook and write data
    await this.build.run(
      new ExportParams({
        start_at: new Date('2023-08-14T00:00:00+0200'),
        end_at: new Date('2023-08-15T00:00:00+0200'),
      }),
      new XLSXWriter('send-test', { fields }),
    );

    // TODO upload
    // TODO cleanup
  }
}
