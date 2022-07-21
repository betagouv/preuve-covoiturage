import { SlicesInterface } from '../../../interfaces/SlicesInterface';
import anyTest, { TestFn } from 'ava';
import os from 'os';
import path from 'path';

import { CreateSlicesSheetToWorkbook } from './CreateSlicesSheetToWorkbook';
import { Workbook, Worksheet } from 'exceljs';

interface Context {
  // Injected tokens

  // Injected tokens method's stubs

  // Tested token
  createSlicesSheetToWorkbook: CreateSlicesSheetToWorkbook;

  // Constants
  FILENAME: string;
}

const test = anyTest as TestFn<Partial<Context>>;

test.beforeEach((t) => {
  t.context.FILENAME = '/tmp/stream-data-test.xlsx';
  t.context.createSlicesSheetToWorkbook = new CreateSlicesSheetToWorkbook();
});

test.afterEach((t) => {});

test('CreateSlicesSheetToWorkbook: should map slice into a dedicated worksheet', async (t) => {
  // Arrange
  const slices: SlicesInterface[] = [{ slice: '2km', tripCount: 2500, incentivesSum: 1500 }];

  // Act
  t.context.createSlicesSheetToWorkbook!.call(t.context.FILENAME!, slices);

  // Assert
  const workbook: Workbook = await new Workbook().xlsx.readFile(t.context.FILENAME!);
  const worksheet: Worksheet = workbook.getWorksheet(t.context.createSlicesSheetToWorkbook!.SLICE_WORKSHEET_NAME);

  // worksheet.getCell()
});
