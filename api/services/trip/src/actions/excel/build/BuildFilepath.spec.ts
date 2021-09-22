import test from 'ava';
import { BuildFilepath } from './BuildFilepath';

let buildFilepath: BuildFilepath;

test.before((t) => {
  buildFilepath = new BuildFilepath();
});

test('BuildFilepath: should build filename from parameter', async (t) => {
  // Act
  const filepath: string = buildFilepath.call('IDFM normal', 4);

  // Assert
  t.true(filepath.startsWith('/tmp/apdf-idfm_nor-4'));
  t.true(filepath.endsWith('.xlsx'));
});
