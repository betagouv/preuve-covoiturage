import test from 'ava';
import path from 'path';
import os from 'os';
import { BuildFilepath } from './BuildFilepath';

let buildFilepath: BuildFilepath;

test.before((t) => {
  buildFilepath = new BuildFilepath();
});

test('BuildFilepath: should build filename from parameters, without campagn name dashes', async (t) => {
  // Arrange
  const start_date: Date = new Date('2021-09-24');

  // Act
  const filepath: string = buildFilepath.call('IDFM-normal', 801, 4, start_date);

  // Assert
  t.true(filepath.startsWith(path.join(os.tmpdir(), 'apdf-4-801-idfm_nor-sept-')));
  t.true(filepath.endsWith('.xlsx'));
});
