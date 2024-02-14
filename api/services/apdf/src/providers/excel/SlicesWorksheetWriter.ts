import { provider } from '@ilos/common';
import { AddWorksheetOptions, Borders, stream, Worksheet } from 'exceljs';
import { SliceStatInterface } from '../../shared/apdf/interfaces/PolicySliceStatInterface';
import { SliceInterface } from '../../shared/policy/common/interfaces/Slices';
import { AbstractWorksheetWriter } from './AbstractWorksheetWriter';

@provider()
export class SlicesWorksheetWriter extends AbstractWorksheetWriter {
  public readonly WORKSHEET_NAME = 'Synthèse par tranche';
  public readonly WORKSHEET_COLUMN_HEADERS = ['Tranche', 'Incitations RPC', 'Tous les trajets', 'Trajets incités'];

  async call(wbWriter: stream.xlsx.WorkbookWriter, slices: SliceStatInterface[]): Promise<void> {
    const options: Partial<AddWorksheetOptions> = { views: [{ showGridLines: false }] };
    const ws: Worksheet = this.initWorkSheet(wbWriter, this.WORKSHEET_NAME, undefined, options);

    // Layout
    const font = { name: 'Arial', size: 12 };
    ws.getColumn('A').width = 20;
    ws.getColumn('A').font = font;
    ws.getColumn('B').width = 20;
    ws.getColumn('B').font = font;
    ws.getColumn('B').numFmt = '# ##0.00€';
    ws.getColumn('C').width = 20;
    ws.getColumn('C').font = font;
    ws.getColumn('D').width = 20;
    ws.getColumn('D').font = font;

    // headers
    const headers = ws.addRow(this.WORKSHEET_COLUMN_HEADERS);
    headers.font = { name: 'Arial', size: 12, bold: true };
    headers.height = 24;
    headers.eachCell((c, colNumber) => {
      if (colNumber > 1) c.alignment = { vertical: 'middle', horizontal: 'right' };
      else c.alignment = { vertical: 'middle' };
      c.border = { bottom: { style: 'thin' } };
    });
    headers.commit();

    // data
    for (const s of slices) {
      const r = ws.addRow([this.formatSliceLabel(s.slice), s.sum / 100, s.count, s.subsidized]);
      r.height = 20;
      r.alignment = { vertical: 'middle' };
      r.commit();
    }

    // add some totals at the bottom of the table
    const last = slices.length + 1;
    const border: Partial<Borders> = { top: { style: 'thin' } };
    ws.getCell(`A${last + 1}`).border = border;
    ws.getCell(`B${last + 1}`).value = { formula: `SUM(B2:B${last})`, date1904: false };
    ws.getCell(`B${last + 1}`).border = border;
    ws.getCell(`C${last + 1}`).value = { formula: `SUM(C2:C${last})`, date1904: false };
    ws.getCell(`C${last + 1}`).border = border;
    ws.getCell(`D${last + 1}`).value = { formula: `SUM(D2:D${last})`, date1904: false };
    ws.getCell(`D${last + 1}`).border = border;

    ws.commit();
  }

  private formatSliceLabel(slice: SliceInterface): string {
    if (!slice.start && slice.end) {
      return `Jusqu'à ${slice.end / 1000} km`;
    } else if (slice.start && !slice.end) {
      return `Supérieure à ${slice.start / 1000} km`;
    }
    return `De ${slice.start / 1000} km à ${slice.end / 1000} km`;
  }
}
