import anyTest, { TestFn } from 'ava';
import { SlicesInterface } from '../../../interfaces/SlicesInterface';

import { Workbook, Worksheet } from 'exceljs';
import { CreateSlicesSheetToWorkbook } from './CreateSlicesSheetToWorkbook';

interface Context {
  // Injected tokens

  // Injected tokens method's stubs

  // Tested token
  createSlicesSheetToWorkbook: CreateSlicesSheetToWorkbook;

  // Constants
  FILEPATH: string;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.FILEPATH = '/tmp/stream-data-test.xlsx';
  t.context.createSlicesSheetToWorkbook = new CreateSlicesSheetToWorkbook();
});

test.afterEach((t) => {});

test('CreateSlicesSheetToWorkbook: should map slice into a dedicated worksheet', async (t) => {
  // Arrange
  const slices: SlicesInterface[] = [{ slice: { min: 2000, max: 15000 }, tripCount: 2500, incentivesSum: 154588 }];

  // Act
  await t.context.createSlicesSheetToWorkbook!.call(t.context.FILEPATH!, slices);

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(t.context.FILEPATH!);
  const worksheet: Worksheet = workbook.getWorksheet(t.context.createSlicesSheetToWorkbook!.SLICE_WORKSHEET_NAME);

  t.is(worksheet.actualRowCount, 2);
  t.deepEqual(workbook.getWorksheet(t.context.createSlicesSheetToWorkbook!.SLICE_WORKSHEET_NAME).getRow(1).values, [
    undefined,
    ...t.context.createSlicesSheetToWorkbook!.SLICE_WORKSHEET_COLUMN_HEADERS.map((h) => h.header! as string),
  ]);
  t.deepEqual(workbook.getWorksheet(t.context.createSlicesSheetToWorkbook!.SLICE_WORKSHEET_NAME).getRow(2).values, [
    undefined,
    `De ${slices[0].slice.min} à ${slices[0].slice.max}`,
    slices[0].incentivesSum / 100,
    slices[0].tripCount,
  ]);
});
