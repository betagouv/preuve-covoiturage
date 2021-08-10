import { Workbook } from 'exceljs';
import { provider } from '@ilos/common';
import os from 'os';
import path from 'path';
import { v4 } from 'uuid';

@provider()
export class ExcelWorkbookHandler {
  static readonly template_location: string = __dirname + '/../../fundcalls_template.xlsx';

  async loadWorkbookTemplate(): Promise<Workbook> {
    const wb = new Workbook();
    return wb.xlsx.readFile(ExcelWorkbookHandler.template_location);
  }

  async writeWorkbookToTempFile(workbook: Workbook, campaign_name: string): Promise<string> {
    const filepath = path.join(os.tmpdir(), `apdf-${campaign_name}-${v4()}`) + '.xlsx';
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }
}
