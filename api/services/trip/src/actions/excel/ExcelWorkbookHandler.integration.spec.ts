import test from 'ava';
import { Workbook } from 'exceljs';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';

let excelWorkbookHandler: ExcelWorkbookHandler;

test.before((t) => {
  excelWorkbookHandler = new ExcelWorkbookHandler();
});

test('ExcelWorkbookHandler: should load excel template file', async (t) => {
  const workbook: Workbook = await excelWorkbookHandler.loadWorkbookTemplate();
  t.true(workbook.worksheets.length !== 0);
  t.is(workbook.worksheets[0].name, 'data');
});

test.todo('ExcelWorkbookHandler: should write workbook to file with proper name');
