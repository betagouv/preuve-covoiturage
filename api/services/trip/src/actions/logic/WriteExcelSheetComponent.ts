import { ExportTripInterface } from './../../interfaces/ExportTripInterface'
import { Workbook } from 'exceljs';
import { LoadExcelFileComponent } from './LoadExcelFileComponent';

export class WriteExcelSheetComponent {


  async call(wb: Workbook, trips: ExportTripInterface[]): Promise<Workbook> {
    

    return null;

  }


}