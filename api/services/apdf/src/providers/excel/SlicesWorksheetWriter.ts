import { provider } from '@ilos/common';
import { AddWorksheetOptions, Borders, stream, Worksheet } from 'exceljs';
import { SliceStatInterface } from '../../shared/apdf/interfaces/PolicySliceStatInterface';
import { SliceInterface } from '../../shared/policy/common/interfaces/Slices';
import { AbstractWorksheetWriter } from './AbstractWorksheetWriter';

@provider()
export class SlicesWorksheetWriter extends AbstractWorksheetWriter {
  public readonly WORKSHEET_NAME = 'Synthèse par tranche';
  public readonly COLUMN_HEADERS_NORMAL = [
    'Tranche "période normale"',
    'Incitations RPC',
    'Tous les trajets',
    'Trajets incités',
  ];
  public readonly COLUMN_HEADERS_BOOSTER = [
    'Tranche "période booster"',
    'Incitations RPC',
    'Tous les trajets',
    'Trajets incités',
  ];

  async call(wbWriter: stream.xlsx.WorkbookWriter, slices: SliceStatInterface[]): Promise<void> {
    const options: Partial<AddWorksheetOptions> = { views: [{ showGridLines: false }] };
    const ws: Worksheet = this.initWorkSheet(wbWriter, this.WORKSHEET_NAME, undefined, options);

    // Layout
    const font = { name: 'Arial', size: 12 };
    ws.getColumn('A').width = 26;
    ws.getColumn('A').font = font;
    ws.getColumn('B').width = 20;
    ws.getColumn('B').font = font;
    ws.getColumn('B').numFmt = '# ##0.00€';
    ws.getColumn('C').width = 20;
    ws.getColumn('C').font = font;
    ws.getColumn('D').width = 20;
    ws.getColumn('D').font = font;

    // Data
    this.drawSliceTable(ws, slices, this.COLUMN_HEADERS_NORMAL, 'normale');
    this.drawSliceTable(ws, slices, this.COLUMN_HEADERS_BOOSTER, 'booster');

    ws.commit();
  }

  private drawSliceTable(
    ws: Worksheet,
    slices: SliceStatInterface[],
    columns: string[],
    mode: 'normale' | 'booster',
  ): void {
    const offset = ws.lastRow ? ws.lastRow.number : 0;

    // apply some margin between tables with empty rows
    const margin = ws.lastRow ? 2 : 0;
    for (let i = 0; i < margin; i++) {
      ws.addRow([]).commit();
    }

    // headers
    const headers = ws.addRow(columns);
    headers.font = { name: 'Arial', size: 12, bold: true };
    headers.height = 24;
    headers.eachCell((c, colNumber) => {
      if (colNumber > 1) c.alignment = { vertical: 'middle', horizontal: 'right' };
      else c.alignment = { vertical: 'middle' };
      c.border = { bottom: { style: 'thin' } };
    });
    headers.commit();

    // data
    // S : incentive_type
    // M : distance
    // R : rpc_incentive
    for (const s of slices) {
      const { start, end } = s.slice;
      const mode_criteria = `Trajets!S:S,"${mode}"`;
      const slice_criteria = `Trajets!M:M,">${start}",Trajets!M:M,"<${end}"`;

      // const r = ws.addRow([this.formatSliceLabel(s.slice), s.sum / 100, s.count, s.subsidized]);
      const r = ws.addRow([
        this.formatSliceLabel(s.slice),
        { date1904: false, formula: `SUMIFS(Trajets!R:R,${mode_criteria},${slice_criteria})` },
        { date1904: false, formula: `COUNTIFS(${mode_criteria},${slice_criteria})` },
        { date1904: false, formula: `COUNTIFS(Trajets!R:R,"<>0",${mode_criteria},${slice_criteria})` },
      ]);
      r.height = 20;
      r.alignment = { vertical: 'middle' };
      r.commit();
    }

    // add some totals at the bottom of the table
    const first = offset + margin + 2;
    const last = offset + margin + slices.length + 1;
    const border: Partial<Borders> = { top: { style: 'thin' } };
    ws.getCell(`A${last + 1}`).border = border;
    ws.getCell(`B${last + 1}`).value = { formula: `SUM(B${first}:B${last})`, date1904: false };
    ws.getCell(`B${last + 1}`).border = border;
    ws.getCell(`C${last + 1}`).value = { formula: `SUM(C${first}:C${last})`, date1904: false };
    ws.getCell(`C${last + 1}`).border = border;
    ws.getCell(`D${last + 1}`).value = { formula: `SUM(D${first}:D${last})`, date1904: false };
    ws.getCell(`D${last + 1}`).border = border;
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
