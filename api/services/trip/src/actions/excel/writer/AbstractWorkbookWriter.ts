import { Column, stream, Worksheet } from 'exceljs';
export abstract class AbstractWorkBookWriter {
  protected workbookWriter: stream.xlsx.WorkbookWriter;
  private worksheet: Worksheet;

  protected prepareWorksheet(filepath: string, worksheetName: string, columns: Partial<Column>[]): Worksheet {
    this.workbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });

    this.worksheet = this.workbookWriter.addWorksheet(worksheetName);
    this.worksheet.columns = columns;
    return this.worksheet;
  }

  protected commitWorksheetChanges(): void {
    return this.worksheet.commit();
  }
}
