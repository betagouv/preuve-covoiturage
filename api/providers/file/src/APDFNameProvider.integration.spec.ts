import test from 'ava';
import { APDFNameProvider } from './APDFNameProvider';

function re(str: string): RegExp {
  return new RegExp(`APDF-${str}.xslx`);
}

test('Stringify APDF', (t) => {
  const provider = new APDFNameProvider();
  const str = provider.stringify({
    name: 'YOLO',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
  t.regex(str, re('2022-01-1-2-yolo'));
});

test('Parse APDF: filename', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('APDF-2022-01-1-2-abc123.xslx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});

test('Parse APDF: filename with prefix', (t) => {
  const provider = new APDFNameProvider();
  t.deepEqual(provider.parse('1/APDF-2022-01-1-2-abc123.xslx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});
