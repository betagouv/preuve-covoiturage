import { AddWorksheetOptions, Column, stream, Worksheet } from 'exceljs';

export abstract class AbstractWorksheetWriter {
  protected initWorkSheet(
    workbook: stream.xlsx.WorkbookWriter,
    worksheetName: string,
    columns?: Partial<Column>[],
    worksheetOptions?: Partial<AddWorksheetOptions>,
  ) {
    const worksheet: Worksheet = workbook.addWorksheet(worksheetName, worksheetOptions);
    if (columns) worksheet.columns = columns;
    return worksheet;
  }
}
