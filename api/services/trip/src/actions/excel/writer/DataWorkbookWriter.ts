import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { APDFTripInterface } from '~/interfaces/APDFTripInterface';
import { normalize } from '../../../helpers/normalizeAPDFDataHelper';
import { PgCursorHandler } from '../../../interfaces/PromisifiedPgCursor';
import { AbstractWorkBookWriter } from './AbstractWorkbookWriter';

@provider()
export class DataWorkBookWriter extends AbstractWorkBookWriter {
  public readonly CURSOR_BATCH_SIZE = 10;
  public readonly DATA_WORKSHEET_NAME = 'trajets';
  // TODO improve listing of columns
  public readonly DATA_WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = [
    'journey_id',
    'start_datetime',
    'end_datetime',
    'driver_rpc_incentive',
    'passenger_rpc_incentive',
    'trip_id',
    'operator_trip_id',
    'driver_uuid',
    'operator_driver_id',
    'passenger_uuid',
    'operator_passenger_id',
    'duration',
    'distance',
    'operator_class',
  ].map((header) => ({ header, key: header }));

  async call(cursor: PgCursorHandler<APDFTripInterface>, workbookWriter: stream.xlsx.WorkbookWriter): Promise<void> {
    const worksheet: Worksheet = this.initWorkSheet(
      workbookWriter,
      this.DATA_WORKSHEET_NAME,
      this.DATA_WORKSHEET_COLUMN_HEADERS,
    );

    const b1 = new Date();
    let results: APDFTripInterface[] = await cursor.read(this.CURSOR_BATCH_SIZE);
    while (results.length !== 0) {
      results.map((t) => worksheet.addRow(normalize(t, 'Europe/Paris')).commit());
      results = await cursor.read(this.CURSOR_BATCH_SIZE);
    }

    const b2 = new Date();
    cursor.release();
    console.debug(`[trip:buildExcelExport] writing trips took: ${(b2.getTime() - b1.getTime()) / 1000}s`);

    worksheet.commit();
    return;
  }
}
