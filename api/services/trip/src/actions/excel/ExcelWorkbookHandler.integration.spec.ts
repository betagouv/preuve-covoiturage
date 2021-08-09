import test from 'ava';
import { Workbook } from 'exceljs';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';

let excelWorkbookHandler: ExcelWorkbookHandler;

test.before((t) => {
  excelWorkbookHandler = new ExcelWorkbookHandler();
});

// TODO: order of sheets should not be tested
test('ExcelWorkbookHandler: should load excel template file', async (t) => {
  const workbook: Workbook = await excelWorkbookHandler.loadWorkbookTemplate();
  t.true(workbook.worksheets.length !== 0);
  t.is(workbook.worksheets[0].name, 'data');
  t.is(workbook.worksheets[1].name, 'Résumé jour');
  t.is(workbook.worksheets[2].name, 'Contrôle INSEE');
});
