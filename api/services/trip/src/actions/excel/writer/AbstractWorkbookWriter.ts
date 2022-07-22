import { Column, stream, Worksheet } from 'exceljs';
export abstract class AbstractWorkBookWriter {
  private workbookWriter: stream.xlsx.WorkbookWriter;

  protected prepareWorksheet(filepath: string, worksheetName: string, columns: Partial<Column>[]): Worksheet {
    this.workbookWriter = new stream.xlsx.WorkbookWriter({
      filename: filepath,
    });

    const worksheet: Worksheet = this.workbookWriter.addWorksheet(worksheetName);
    worksheet.columns = columns;
    return worksheet;
  }

  protected commitChanges(): Promise<void> {
    return this.workbookWriter.commit();
  }
}
