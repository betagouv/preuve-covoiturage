import { excel } from '@/deps.ts';

export abstract class AbstractWorksheetWriter {
  protected initWorkSheet(
    workbook: excel.stream.xlsx.WorkbookWriter,
    worksheetName: string,
    columns?: Partial<excel.Column>[],
    worksheetOptions?: Partial<excel.AddWorksheetOptions>,
  ) {
    const worksheet: excel.Worksheet = workbook.addWorksheet(worksheetName, worksheetOptions);
    if (columns) worksheet.columns = columns;
    return worksheet;
  }
}
