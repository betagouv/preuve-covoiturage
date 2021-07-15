import { Workbook } from 'exceljs';

export class LoadExcelFileComponent {

  static readonly template_location: string = __dirname+'/../../fundcalls_template.xlsx';

  async call(): Promise<Workbook> {
    const wb = new Workbook();
    return wb.xlsx.readFile(LoadExcelFileComponent.template_location);
  }

}