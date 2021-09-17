import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';
import { provider } from '@ilos/common';
import { ExportTripInterface } from '../../interfaces';
import { TripRepositoryProvider } from '../../providers/TripRepositoryProvider';
import { Workbook, stream } from 'exceljs';
import { StreamDataToWorkBook } from './StreamDataToWorkbook';

@provider()
export class BuildExcelFile {
  constructor(
    private tripRepositoryProvider: TripRepositoryProvider,
    private excelWorkbookHandler: ExcelWorkbookHandler,
    private streamDataToWorkBook: StreamDataToWorkBook,
  ) {}

  async call(
    campaign_id: number,
    start_date: Date,
    end_date: Date,
    campaign_name: string,
    operator_id?: number,
  ): Promise<string> {
    // Get cursor
    const tripCursor: (count: number) => Promise<ExportTripInterface[]> = await this.getCursor(
      campaign_id,
      start_date,
      end_date,
      operator_id,
    );

    // Get filepath
    const filename: string = this.excelWorkbookHandler.buildExcelFileName(campaign_name, operator_id);

    // Build workbook stream from filepath
    const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
      filename,
    });

    // Stream data and return filename
    return this.streamDataToWorkBook.call(tripCursor, workbookWriter).then(() => filename);
  }

  private getCursor(
    campaign_id: number,
    start_date: Date,
    end_date: Date,
    operator_id?: number,
  ): Promise<(count: number) => Promise<ExportTripInterface[]>> {
    return this.tripRepositoryProvider.searchWithCursor(
      {
        date: {
          start: start_date,
          end: end_date,
        },
        campaign_id: [campaign_id],
        operator_id: operator_id ? [operator_id] : null,
      },
      'territory',
    );
  }
}
