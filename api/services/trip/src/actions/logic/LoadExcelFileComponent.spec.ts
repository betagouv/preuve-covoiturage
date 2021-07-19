import test from 'ava';
import { Workbook } from 'exceljs';
import { LoadExcelFileComponent } from './LoadExcelFileComponent';

let loader: LoadExcelFileComponent;

test.before((t) => {
  loader = new LoadExcelFileComponent();
})


// TODO: order of sheet should not be tested
test('LoadExcelFileComponent: should load excel template file', async (t) => {
  const workbook: Workbook = await loader.call();
  t.true(workbook.worksheets.length !== 0)
  t.is(workbook.worksheets[0].name, 'data')
  t.is(workbook.worksheets[1].name, 'Résumé opérateurs')
  t.is(workbook.worksheets[2].name, 'Résumé jours')
  t.is(workbook.worksheets[3].name, 'Résumé départements')
});