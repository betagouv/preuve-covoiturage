import { Workbook } from 'exceljs';

export class ExcelWorkbookHandler {

  static readonly template_location: string = __dirname+'/../../fundcalls_template.xlsx';

  // Should be transformed to private method at some point
  async loadTemplate(): Promise<Workbook> {
    const wb = new Workbook();
    return wb.xlsx.readFile(ExcelWorkbookHandler.template_location);
  }

  // async getwRitableXslx(): Promise<Workbook> {
  //   const wb = new Workbook();
  //   wb.xlsx.writeFile
  // }

}