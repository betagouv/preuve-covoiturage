import { Column, stream, Worksheet } from 'exceljs';
export abstract class AbstractWorkBookWriter {
  protected getWorkbookWriter(filepath: string): stream.xlsx.WorkbookWriter {
    const workbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });
    return workbookWriter;
  }

  protected initWorkSheet(
    workbookWriter: stream.xlsx.WorkbookWriter,
    worksheetName: string,
    columns: Partial<Column>[],
  ) {
    const worksheet: Worksheet = workbookWriter.addWorksheet(worksheetName);
    worksheet.columns = columns;
    return worksheet;
  }
}
