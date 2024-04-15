import test from 'ava';
import os from 'os';
import path from 'path';
import { APDFNameProvider } from './APDFNameProvider';

test('Stringify APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filename({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_00,
    }),
    'APDF-2022-01-1-2-111-100-22200-yolo.xlsx',
  );
});

test('Stringify APDF: filename null trips and amount', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 0,
      subsidized: 0,
      amount: 0,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-0-0-0-yolo.xlsx'),
  );
});

test('Stringify APDF: filename rounded amount', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_99,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-111-100-22299-yolo.xlsx'),
  );
});

test('Stringify APDF: filepath with string', (t) => {
  const provider = new APDFNameProvider();
  t.is(provider.filepath('APDF-2022-01-1-2-3-4-yolo.xlsx'), path.join(os.tmpdir(), 'APDF-2022-01-1-2-3-4-yolo.xlsx'));
});

test('Stringify APDF: filepath with object', (t) => {
  const provider = new APDFNameProvider();
  t.is(
    provider.filepath({
      name: 'YOLO',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
      trips: 111,
      subsidized: 100,
      amount: 222_00,
    }),
    path.join(os.tmpdir(), 'APDF-2022-01-1-2-111-100-22200-yolo.xlsx'),
  );
});

test('Parse APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('APDF-2022-01-1-2-111-100-22200-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
    trips: 111,
    subsidized: 100,
    amount: 222_00,
  });
});

test('Parse APDF: filename with prefix', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('1/APDF-2022-01-1-2-111-100-22200-abc123.xlsx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
    trips: 111,
    subsidized: 100,
    amount: 222_00,
  });
});
