import anyTest, { TestFn } from 'ava';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';

import { Workbook, Worksheet } from 'exceljs';
import { SlicesWorkbookWriter } from './SlicesWorkbookWriter';

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
  const slices: SlicesInterface[] = [
    { slice: { max: 2000 }, tripCount: 2500, incentivesSum: 154588 },
    { slice: { min: 2000, max: 30000 }, tripCount: 3000, incentivesSum: 204598 },
    { slice: { min: 30000 }, tripCount: 5000, incentivesSum: 304456 },
  ];

  // Act
  await t.context.slicesWorkbookWriter!.call(t.context.FILEPATH!, slices);

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
    `Jusqu'à ${slices[0].slice.max} km`,
    slices[0].incentivesSum / 100,
    slices[0].tripCount,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(3).values, [
    undefined,
    `De ${slices[1].slice.min} km à ${slices[1].slice.max} km`,
    slices[1].incentivesSum / 100,
    slices[1].tripCount,
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.slicesWorkbookWriter!.SLICE_WORKSHEET_NAME).getRow(4).values, [
    undefined,
    `Supérieur à ${slices[2].slice.min} km`,
    slices[2].incentivesSum / 100,
    slices[2].tripCount,
  ]);
});
