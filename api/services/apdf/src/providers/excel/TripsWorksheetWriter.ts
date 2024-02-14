import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { normalize } from '../../helpers/normalizeAPDFData.helper';
import { APDFTripInterface } from '../../interfaces/APDFTripInterface';
import { PgCursorHandler } from '../../shared/common/PromisifiedPgCursor';
import { AbstractWorksheetWriter } from './AbstractWorksheetWriter';

@provider()
export class TripsWorksheetWriter extends AbstractWorksheetWriter {
  public readonly CURSOR_BATCH_SIZE = 100;
  public readonly WORKSHEET_NAME = 'Trajets';
  // TODO improve listing of columns
  public readonly WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = [
    'journey_id',
    'trip_id',
    'operator_trip_id',
    'start_datetime',
    'end_datetime',
    'start_location',
    'start_epci_name',
    'start_insee',
    'end_location',
    'end_epci_name',
    'end_insee',
    'duration',
    'distance',
    'operator',
    'operator_class',
    'operator_driver_id',
    'operator_passenger_id',
    'rpc_incentive',
    'incentive_type',
  ].map((header) => ({ header, key: header }));

  async call(
    cursor: PgCursorHandler<APDFTripInterface>,
    booster_dates: Set<string>,
    workbookWriter: stream.xlsx.WorkbookWriter,
  ): Promise<void> {
    const worksheet: Worksheet = this.initWorkSheet(workbookWriter, this.WORKSHEET_NAME, this.WORKSHEET_COLUMN_HEADERS);

    // style columns and apply optimised width
    const font = { name: 'Mono', family: 3, size: 10 };
    const columns = {
      A: { width: 33, font },
      B: { width: 33, font },
      C: { width: 33, font },
      D: { width: 24, font },
      E: { width: 24, font },
      F: { width: 24, font },
      G: { width: 36, font },
      H: { width: 11, font },
      I: { width: 24, font },
      J: { width: 36, font },
      K: { width: 11, font },
      L: { width: 11, font },
      M: { width: 11, font },
      N: { width: 20, font },
      O: { width: 20, font },
      P: { width: 33, font },
      Q: { width: 33, font },
      R: { width: 14, font },
      S: { width: 14, font },
    };

    Object.entries(columns).forEach(([key, value]) => {
      Object.entries(value).forEach(([k, v]) => {
        worksheet.getColumn(key)[k] = v;
      });
    });

    // style the header
    worksheet.getRow(1).font = { name: 'Mono', family: 3, bold: true, size: 10 };

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
