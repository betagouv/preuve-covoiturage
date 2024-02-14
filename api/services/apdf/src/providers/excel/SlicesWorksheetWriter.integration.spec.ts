import anyTest, { TestFn } from 'ava';
import { stream, Workbook, Worksheet } from 'exceljs';
import { SliceStatInterface } from '../../shared/apdf/interfaces/PolicySliceStatInterface';
import { BuildExcel } from './BuildExcel';
import { SlicesWorksheetWriter } from './SlicesWorksheetWriter';

interface Context {
  // Injected tokens

  // Injected tokens method's stubs

  // Tested token
  slicesWorksheetWriter: SlicesWorksheetWriter;

  // Constants
  FILEPATH: string;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.FILEPATH = '/tmp/stream-data-test.xlsx';
  t.context.slicesWorksheetWriter = new SlicesWorksheetWriter();
});

test.afterEach((t) => {});

test('SlicesWorkbookWriter: should map slice into a dedicated worksheet', async (t) => {
  // Arrange
  const slices: SliceStatInterface[] = [
    { slice: { start: 0, end: 2000 }, count: 2500, sum: 154588, subsidized: 2400 },
    { slice: { start: 2000, end: 30000 }, count: 3000, sum: 204598, subsidized: 2500 },
    { slice: { start: 30000 }, count: 5000, sum: 304456, subsidized: 4000 },
  ];

  // Act
  const workbookWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(t.context.FILEPATH!);
  await t.context.slicesWorksheetWriter!.call(workbookWriter, slices);
  await workbookWriter.commit();

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(t.context.FILEPATH!);
  const worksheet: Worksheet = workbook.getWorksheet(t.context.slicesWorksheetWriter!.WORKSHEET_NAME);

  t.is(worksheet.actualRowCount, 2 + slices.length);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorksheetWriter!.WORKSHEET_NAME).getRow(1).values, [
    undefined,
    ...t.context.slicesWorksheetWriter!.COLUMN_HEADERS_NORMAL,
  ]);

  t.deepEqual(workbook.getWorksheet(t.context.slicesWorksheetWriter!.WORKSHEET_NAME).getRow(2).values, [
    undefined,
    `Jusqu'à ${slices[0].slice.end / 1000} km`,
    slices[0].sum / 100,
    slices[0].count,
    slices[0].subsidized,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorksheetWriter!.WORKSHEET_NAME).getRow(3).values, [
    undefined,
    `De ${slices[1].slice.start / 1000} km à ${slices[1].slice.end / 1000} km`,
    slices[1].sum / 100,
    slices[1].count,
    slices[1].subsidized,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorksheetWriter!.WORKSHEET_NAME).getRow(4).values, [
    undefined,
    `Supérieure à ${slices[2].slice.start / 1000} km`,
    slices[2].sum / 100,
    slices[2].count,
    slices[2].subsidized,
  ]);
});
