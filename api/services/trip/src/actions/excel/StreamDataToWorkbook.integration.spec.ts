import { StreamDataToWorkBook } from './StreamDataToWorkbook';
import test from 'ava';
import { ExportTripInterface } from '../../interfaces';
import { exportTripInterface } from './StreamDataToWorkBookSheet.spec';
import { stream, Workbook, Worksheet } from 'exceljs';

let streamDataToWorkBook: StreamDataToWorkBook;

test.before((t) => {
  streamDataToWorkBook = new StreamDataToWorkBook();
});

test('StreamDataToWorkBook: should stream data to a workbook stream file', async (t) => {
  // Arrange
  const tripCursor = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
      exportTripInterface,
    ]);
  });
  const cursorEndingResult = new Promise<ExportTripInterface<Date>[]>((resolve, reject) => {
    resolve([]);
  });
  let counter = 20;
  const cursorCallback = (count: number): Promise<ExportTripInterface<Date>[]> => {
    if (counter <= 0) {
      return cursorEndingResult;
    }
    counter = counter - 10;
    return tripCursor;
  };

  const filename = '/tmp/stream-data-test.xlsx';

  const workbookWriter: stream.xlsx.WorkbookWriter = new stream.xlsx.WorkbookWriter({
    filename,
  });

  // Act
  await streamDataToWorkBook.call(cursorCallback, workbookWriter);

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(filename);
  const worksheet: Worksheet = workbook.getWorksheet('Données');
  t.is(worksheet.actualRowCount, 11);
});

test.todo('ExcelWorkbookHandler: should write workbook to file with proper name');
