import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeAPDFData.helper';
import { APDFTripInterface } from '../../interfaces/APDFTripInterface';
import { PgCursorHandler } from '../../shared/common/PromisifiedPgCursor';
import { AbstractWorksheetWriter } from './AbstractWorksheetWriter';

@provider()
export class TripsWorksheetWriter extends AbstractWorksheetWriter {
  public readonly CURSOR_BATCH_SIZE = 10;
  public readonly WORKSHEET_NAME = 'trajets';
  // TODO improve listing of columns
  public readonly WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = [
    'journey_id',
    'start_datetime',
    'end_datetime',
    'rpc_incentive',
    'start_location',
    'start_insee',
    'end_location',
    'end_insee',
    'duration',
    'distance',
    'operator',
    'operator_class',
    'trip_id',
    'operator_trip_id',
    'driver_uuid',
    'operator_driver_id',
    'passenger_uuid',
    'operator_passenger_id',
    'incentive_type',
    'start_epci_name',
    'start_epci',
    'end_epci_name',
    'end_epci',
  ].map((header) => ({ header, key: header }));

  async call(
    cursor: PgCursorHandler<APDFTripInterface>,
    booster_dates: Set<string>,
    workbookWriter: stream.xlsx.WorkbookWriter,
  ): Promise<void> {
    const worksheet: Worksheet = this.initWorkSheet(workbookWriter, this.WORKSHEET_NAME, this.WORKSHEET_COLUMN_HEADERS);

    const b1 = new Date();
    let results: APDFTripInterface[] = await cursor.read(this.CURSOR_BATCH_SIZE);
    while (results.length !== 0) {
      results.map((t) => worksheet.addRow(normalize(t, booster_dates, 'Europe/Paris')).commit());
      results = await cursor.read(this.CURSOR_BATCH_SIZE);
    }

    const b2 = new Date();
    cursor.release();
    console.debug(`[apdf:export] writing trips took: ${(b2.getTime() - b1.getTime()) / 1000}s`);

    worksheet.commit();
    return;
  }
}
