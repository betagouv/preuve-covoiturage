import anyTest, { TestFn } from 'ava';

import { stream, Workbook, Worksheet } from 'exceljs';
import { SlicesWorkbookWriter } from './SlicesWorkbookWriter';
import { BuildExcel } from '../BuildExcel';
import { SliceStatInterface } from '../../../shared/apdf/interfaces/PolicySliceStatInterface';
import { APDFRepositoryProvider } from '../../../providers/APDFRepositoryProvider';

interface Context {
  // Injected tokens

  // Injected tokens method's stubs

  // Tested token
  slicesWorkbookWriter: SlicesWorkbookWriter;

  // Constants
  FILEPATH: string;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.FILEPATH = '/tmp/stream-data-test.xlsx';
  t.context.slicesWorkbookWriter = new SlicesWorkbookWriter();
});

test.afterEach((t) => {});

test('SlicesWorkbookWriter: should map slice into a dedicated worksheet', async (t) => {
  // Arrange
  const slices: SliceStatInterface[] = [
    { slice: { start: 0, end: 2000 }, count: 2500, sum: 154588 },
    { slice: { start: 2000, end: 30000 }, count: 3000, sum: 204598 },
    { slice: { start: 30000, end: APDFRepositoryProvider.MAX_DISTANCE_METERS }, count: 5000, sum: 304456 },
  ];

  // Act
  const workbookWriter: stream.xlsx.WorkbookWriter = BuildExcel.initWorkbookWriter(t.context.FILEPATH!);
  await t.context.slicesWorkbookWriter!.call(workbookWriter, slices);
  await workbookWriter.commit();

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(t.context.FILEPATH!);
  const worksheet: Worksheet = workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME);

  t.is(worksheet.actualRowCount, 4);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(1).values, [
    undefined,
    ...t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_COLUMN_HEADERS.map((h) => h.header! as string),
  ]);

  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(2).values, [
    undefined,
    `Jusqu'à ${slices[0].slice.end / 1000} km`,
    slices[0].sum / 100,
    slices[0].count,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(3).values, [
    undefined,
    `De ${slices[1].slice.start / 1000} km à ${slices[1].slice.end / 1000} km`,
    slices[1].sum / 100,
    slices[1].count,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(4).values, [
    undefined,
    `Supérieur à ${slices[2].slice.start / 1000} km`,
    slices[2].sum / 100,
    slices[2].count,
  ]);
});
