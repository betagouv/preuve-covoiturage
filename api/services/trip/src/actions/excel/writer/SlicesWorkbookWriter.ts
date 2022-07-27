import { provider } from '@ilos/common';
import { Column, stream, Worksheet } from 'exceljs';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';
import { ProgressiveDistanceRangeMetaParameters } from '~/shared/policy/common/interfaces/ProgressiveDistanceRangeMetaParameters';
import { AbstractWorkBookWriter } from './AbstractWorkbookWriter';
import { TripRepositoryProvider } from '../../../providers/TripRepositoryProvider';

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

  call(slices: SlicesInterface[], workbookWriter: stream.xlsx.WorkbookWriter): void {
    const worksheet: Worksheet = this.initWorkSheet(
      workbookWriter,
      this.SLICE_WORKSHEET_NAME,
      this.SLICE_WORKSHEET_COLUMN_HEADERS,
    );

    slices.forEach((s) => {
      worksheet.addRow([this.formatSliceLabel(s.slice), s.incentivesSum / 100, s.tripCount]).commit();
    });

    worksheet.commit();
  }

  private formatSliceLabel(slice: ProgressiveDistanceRangeMetaParameters): string {
    if (!slice.min && slice.max) {
      return `Jusqu'à ${slice.max} km`;
    } else if (slice.max === TripRepositoryProvider.MAX_KM_LIMIT) {
      return `Supérieur à ${slice.min} km`;
    }
    return `De ${slice.min} km à ${slice.max} km`;
  }
}
