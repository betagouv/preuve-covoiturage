import { GeoImporter } from './GeoImporter';

import anyTest, { TestInterface } from 'ava';


interface TestContext {
  provider: GeoImporter;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.provider = new GeoImporter();
});

test('TerritoryAdministrativeDataProvider: should list regions', async t => {
  const result = await t.context.provider.listRegions();
  t.is(result.length, 20);
  const resultKeys = result.map(r => Object.keys(r));
  t.is(resultKeys.filter(rk => rk.length !== 2).length, 0);
  t.is(resultKeys.reduce((s, i) => {s.add(i[0]); s.add(i[1]); return s}, new Set<string>()), new Set(['name', 'code']));
});

test('TerritoryAdministrativeDataProvider: should list districts', async t => {
  const result = await t.context.provider.listDistrictsByRegionCode('20');
  t.is(result.length, 20);
  const resultKeys = result.map(r => Object.keys(r));
  t.is(resultKeys.filter(rk => rk.length !== 2).length, 0);
  t.is(resultKeys.reduce((s, i) => {s.add(i[0]); s.add(i[1]); return s}, new Set<string>()), new Set(['name', 'code']));
});

test('TerritoryAdministrativeDataProvider: should list districts', async t => {
  const result = await t.context.provider.listDistrictsByRegionCode('20');
  t.is(result.length, 20);
  const resultKeys = result.map(r => Object.keys(r));
  t.is(resultKeys.filter(rk => rk.length !== 2).length, 0);
  t.is(resultKeys.reduce((s, i) => {s.add(i[0]); s.add(i[1]); return s}, new Set<string>()), new Set(['name', 'code']));
});

test('TerritoryAdministrativeDataProvider: should raise error if region doesnt exists', async t => {
  const result = await t.context.provider.listDistrictsByRegionCode('nope');
  // raise error
  t.is(result.length, 20);
});
