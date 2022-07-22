import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';

/***
 * Tranches       | Somme incentives  | Nombre trajet
 * Tranche 1      | 1500              | 2250
 * Tranche 2      | 2896              | 3000
 */

@provider()
export class CreateSlicesSheetToWorkbook {
  public readonly SLICE_WORKSHEET_NAME = 'Tranches';
  public readonly SLICE_WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = [
    { header: 'Tranche', key: 'slice' },
    { header: 'Somme incitations', key: 'incentivesSum' },
    { header: 'Nombre Trajet', key: 'tripCount' },
  ];

  async call(filepath: string, slices: SlicesInterface[]): Promise<void> {
    const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
    const worksheet: Worksheet = workbookWriter.addWorksheet(this.SLICE_WORKSHEET_NAME);

    worksheet.columns = this.SLICE_WORKSHEET_COLUMN_HEADERS;
    slices.forEach((s) => {
      worksheet
        .addRow([`De ${slices[0].slice.min} à ${slices[0].slice.max}`, s.incentivesSum / 100, s.tripCount])
        .commit();
    });
    return workbookWriter.commit();
  }
}
