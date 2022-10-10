import test from 'ava';
import { APDFNameProvider } from './APDFNameProvider';

function re(str: string): RegExp {
  return new RegExp(`APDF-${str}-[a-z0-9]{6}.xslx`);
}

test('Stringify APDF', (t) => {
  const provider = new APDFNameProvider(t.log);
  t.regex(
    provider.stringify({
      name: 'yolo',
      datetime: new Date('2022-01-01T00:00:00Z'),
      campaign_id: 1,
      operator_id: 2,
    }),
    re('2022-01-1-2'),
  );
});

test('Parse APDF: filename', (t) => {
  const provider = new APDFNameProvider(t.log);
  t.deepEqual(provider.parse('APDF-2022-01-1-2-abc123.xslx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});

test('Parse APDF: filename with prefix', (t) => {
  const provider = new APDFNameProvider(t.log);
  t.deepEqual(provider.parse('1/APDF-2022-01-1-2-abc123.xslx'), {
    name: 'abc123',
    datetime: new Date('2022-01-01T00:00:00Z'),
    campaign_id: 1,
    operator_id: 2,
  });
});
