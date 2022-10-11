import test from 'ava';
import path from 'path';
import os from 'os';
import { APDFNameProvider } from './APDFNameProvider';

test('Stringify APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.stringify({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
    }),
    'APDF-2022-01-1-2-yolo.xlsx',
  );
});

test('Stringify APDF: filepath with string', (t) => {
  const provider = new APDFNameProvider();
  t.is(provider.filepath('APDF-2022-01-1-2-yolo.xlsx'), path.join(os.tmpdir(), 'APDF-2022-01-1-2-yolo.xlsx'));
});

test('Stringify APDF: filepath with object', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-yolo.xlsx'),
  );
});

test('Parse APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('APDF-2022-01-1-2-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});

test('Parse APDF: filename with prefix', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('1/APDF-2022-01-1-2-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});
