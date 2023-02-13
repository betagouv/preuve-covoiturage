import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { DataRepositoryProvider } from '../../../providers/APDFRepositoryProvider';
import { SliceStatInterface } from '../../../shared/apdf/interfaces/PolicySliceStatInterface';
import { SliceInterface } from '../../../shared/policy/common/interfaces/SliceInterface';
import { AbstractWorkBookWriter } from './AbstractWorkbookWriter';

/***
 * Tranches       | Somme incentives  | Nombre trajet
 * Tranche 1      | 1500              | 2250
 * Tranche 2      | 2896              | 3000
 */

@provider()
export class SlicesWorkbookWriter extends AbstractWorkBookWriter {
  public readonly SLICE_WORKSHEET_NAME = 'Tranches';
  public readonly SLICE_WORKSHEET_COLUMN_HEADERS: Partial<Column>[] = [
    { header: 'Tranche', key: 'slice' },
    { header: 'Somme rpc incentive (€)', key: 'incentivesSum' },
    { header: 'Nombre de trip_id', key: 'tripCount' },
  ];

  async call(workbookWriter: stream.xlsx.WorkbookWriter, slices: SliceStatInterface[]): Promise<void> {
    const worksheet: Worksheet = this.initWorkSheet(
      workbookWriter,
      this.SLICE_WORKSHEET_NAME,
      this.SLICE_WORKSHEET_COLUMN_HEADERS,
    );

    slices.forEach((s) => {
      worksheet.addRow([this.formatSliceLabel(s.slice), s.sum / 100, s.count]).commit();
    });

    worksheet.commit();
  }

  private formatSliceLabel(slice: SliceInterface): string {
    if (!slice.start && slice.end) {
      return `Jusqu'à ${slice.end / 1000} km`;
    } else if (slice.start && !slice.end) {
      return `Supérieur à ${slice.start / 1000} km`;
    }
    return `De ${slice.start / 1000} km à ${slice.end / 1000} km`;
  }
}
