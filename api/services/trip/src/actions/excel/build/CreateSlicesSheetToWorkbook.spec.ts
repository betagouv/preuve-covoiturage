import test from 'ava';
import path from 'path';
import os from 'os';
import { BuildFilepath } from './BuildFilepath';

let buildFilepath: BuildFilepath;

test.before((t) => {
  buildFilepath = new BuildFilepath();
});

test('CreateSlicesSheetToWorkbook: should fetch and stream slices to workbook', async (t) => {
  // Arrange

  // Act
  const filepath: string = buildFilepath.call('IDFM normal', 4, start_date);

  // Assert
  t.true(filepath.startsWith(path.join(os.tmpdir(), 'apdf-idfm_nor-4-sept-')));
  t.true(filepath.endsWith('.xlsx'));
});
