import { provider } from '@ilos/common';
import { stream, Worksheet } from 'exceljs';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';

/***
 * Tranches       | Somme incentives  | Nombre trajet
 * Tranche 1      | 1500              | 2250
 * Tranche 2      | 2896              | 3000
 */

@provider()
export class CreateSlicesSheetToWorkbook {
  public readonly SLICE_WORKSHEET_NAME = 'Tranches';

  async call(filepath: string, slices: SlicesInterface[]): Promise<void> {
    const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
    const worksheet: Worksheet = workbookWriter.addWorksheet(this.SLICE_WORKSHEET_NAME);

    slices.forEach((s) => {
      worksheet.addRow(s);
    });
  }
}
