import { ConfigInterface } from '@ilos/common/index.ts';
import test from 'ava';
import { CronFrequency, MatviewItem } from '../interfaces/StatsRefreshInterfaces.ts';
import { filterTables } from './filterTables.helper.ts';

// helper to generate the db results from an array
function makeRows(l: string[]): MatviewItem[] {
  return l.map((matviewname) => ({ matviewname }));
}

// helper to mock config.refresh.skip
// pass a Set to be used as a result
function makeConfig(s: Set<string>): ConfigInterface {
  return {
    get<T>(key: string, fallback?: T): T {
      return s as T;
    },
  };
}

const views = ['daily_view_1', 'daily_view_2', 'weekly_view_1', 'weekly_view_2', 'monthly_view_1', 'monthly_view_2'];

test('filter monthly, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['monthly'];
  const rows = makeRows(views);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['monthly_view_1', 'monthly_view_2'];
  t.deepEqual(actual, expected);
});

test('filter weekly, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['weekly'];
  const rows = makeRows(views);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['weekly_view_1', 'weekly_view_2'];
  t.deepEqual(actual, expected);
});

test('filter daily, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['daily'];
  const rows = makeRows(views);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['daily_view_1', 'daily_view_2'];
  t.deepEqual(actual, expected);
});

test('filter monthly with non prefixed views, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['monthly'];
  const rows = makeRows([...views, 'no_prefix_table']);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['monthly_view_1', 'monthly_view_2'];
  t.deepEqual(actual, expected);
});

test('filter daily with non prefixed views, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['daily'];
  const rows = makeRows([...views, 'no_prefix_table']);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['daily_view_1', 'daily_view_2', 'no_prefix_table'];
  t.deepEqual(actual, expected);
});

test('filter monthly, daily with non prefixed views, no skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set());
  const frequencies: CronFrequency[] = ['daily', 'monthly'];
  const rows = makeRows([...views, 'no_prefix_table']);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['daily_view_1', 'daily_view_2', 'monthly_view_1', 'monthly_view_2', 'no_prefix_table'];
  t.deepEqual(actual, expected);
});

test('filter daily, monthly with skips', (t) => {
  const schema = 'test';
  const config = makeConfig(new Set(['test.monthly_view_1']));
  const frequencies: CronFrequency[] = ['daily', 'monthly'];
  const rows = makeRows([...views, 'no_prefix_table']);
  const actual = filterTables(config, frequencies, schema, rows);
  const expected = ['daily_view_1', 'daily_view_2', 'monthly_view_2', 'no_prefix_table'];
  t.deepEqual(actual, expected);
});
