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
    const filepath =
      path.join(
        os.tmpdir(),
        `apdf-${this.sanitazeString(campaign_name)}-${this.getMonthString()}-${v4().substring(0, 6)}`,
      ) + '.xlsx';
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  private sanitazeString(campaign_name: string): string {
    return campaign_name.toLowerCase().substring(0, 8).replace(/\ /g, '_');
  }

  private getMonthString(): string {
    const currentDateMinusOneMonth: Date = new Date();
    currentDateMinusOneMonth.setMonth(currentDateMinusOneMonth.getMonth() - 3);
    return currentDateMinusOneMonth
      .toLocaleString('fr-FR', { month: 'long' })
      .substring(0, 4)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
