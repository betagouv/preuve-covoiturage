import test from 'ava';
import { Workbook } from 'exceljs';
import { LoadExcelFileComponent } from './LoadExcelFileComponent';

let loader: LoadExcelFileComponent;

test.before((t) => {
  loader = new LoadExcelFileComponent();
})

test('LoadExcelFileComponent: should load excel template file', async (t) => {
  const workbook: Workbook = await loader.call();
  t.true(workbook.worksheets.length !== 0)
});