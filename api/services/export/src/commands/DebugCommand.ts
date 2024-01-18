import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { ExportParams } from '../models/ExportParams';
import { XLSXWriter } from '../models/XLSXWriter';
import { BuildServiceInterfaceResolver } from '../services/BuildService';

@command()
export class DebugCommand implements CommandInterface {
  static readonly signature: string = 'export:debug';
  static readonly description: string = 'Test and debug the export service';
  static readonly options: CommandOptionType[] = [
    // TODO add options to define the user email, the type of export, the date range, etc.
  ];

  constructor(private build: BuildServiceInterfaceResolver) {}

  public async call(): Promise<void> {
    // TODO normalise params
    const params = new ExportParams({
      start_at: new Date('2023-08-14T08:00:00+0100'),
      end_at: new Date('2023-08-14T12:00:00+0100'),
    });

    // TODO create ExportFile entity and pass it to the provider
    // TODO get the file name from the config as done in APDFNameProvider
    const fileWriter = new XLSXWriter('send-test', {
      compress: true,
      fields: ['trip_id', 'policy_id', 'operator', 'campaign_mode'],

      // define computed fields to be added to the carpool row
      // it takes a name (snake case, lowercase, no spaces, no special characters...)
      // and a compute function which will bind the datasources together to get the result.
      //
      // Try to put the logic in the models and use the compute function as a controller to
      // bind tools together.
      //
      // Keep in mind this will run for EVERY SINGLE row of the file, so keep it fast
      // and preload data in the datasources in the calling service.
      computed: [
        {
          name: 'campaign_mode',
          compute(row, datasources) {
            const campaign = datasources.get('campaigns').get(row.value('campaign_id'));
            return campaign.getModeAt([row.value('start_datetime_utc'), row.value('end_datetime_utc')]);
          },
        },
      ],
    });

    // create the Workbook and write data
    try {
      await fileWriter.create();
      await this.build.run(params, fileWriter);
      await fileWriter.printHelp();
    } catch (e) {
      console.error(e.message);
    } finally {
      await fileWriter.close();
      console.info(`File written to ${fileWriter.workbookPath}`);
    }

    // compress the file
    await fileWriter.compress();
    console.info(`File compressed to ${fileWriter.archivePath}`);

    // TODO upload
    // TODO cleanup
  }
}
