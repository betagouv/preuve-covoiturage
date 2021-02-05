import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { Level, TerritoryAdministrativeDataProvider } from './TerritoryAdministrativeDataProvider';

interface TestContext {
  connection: PostgresConnection;
  provider: TerritoryAdministrativeDataProvider;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });
  await t.context.connection.up();
  t.context.provider = new TerritoryAdministrativeDataProvider(t.context.connection);
});

test.after.always(async (t) => {
  // await t.context.connection.getClient().query({
  //   text: `DELETE FROM ${t.context.repository.table} WHERE acquisition_id = $1`,
  //   values: [0],
  // });
  await t.context.connection.down();
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

test('TerritoryAdministrativeDataProvider: should get territory id if exists', async t => {
  const input = [
    { name: "Test", code: "dont exits" },
    { name: "Ile-de-France", code: '1212313'},
  ];

  const result = await t.context.provider.getTerritoriesIdByCodes(Level.Region, input);
  t.is(result.length, 2);
  t.is(Object.keys(result.find(r => name === 'Test')), ['name', 'code']);
  t.is(Object.keys(result.find(r => name === 'Ile-de-France')), ['name', 'code', 'territory_id']);
});

test('TerritoryAdministrativeDataProvider: should create territory without geo', async t => {
  const input = [
    { name: "Test", code: "dont exits" },
    { name: "Test", code: "dont exits" },
    { name: "Test", code: "dont exits" },
  ];

  const result = await t.context.provider.createTerritories(Level.Region, input);
  t.is(result.length, 2);
  t.is(Object.keys(result.find(r => name === 'Test')), ['name', 'code']);
});

test('TerritoryAdministrativeDataProvider: should create territory with geo', async t => {
  const input = [
    { name: "Test", code: "dont exits" },
    { name: "Test", code: "dont exits" },
    { name: "Test", code: "dont exits" },
  ];

  const result = await t.context.provider.createTerritories(Level.Region, input);
  t.is(result.length, 2);
  t.is(Object.keys(result.find(r => name === 'Test')), ['name', 'code']);
});

test('TerritoryAdministrativeDataProvider: should update territory without geo', async t => {
  const input = [
    { territory_id: 1, name: "Test", code: "dont exits" },
    { territory_id: 1, name: "Test", code: "dont exits" },
    { territory_id: 1, name: "Test", code: "dont exits" },
  ];

  const result = await t.context.provider.updateTerritories(Level.Region, input);
  t.is(result.length, 2);
  t.is(Object.keys(result.find(r => name === 'Test')), ['name', 'code']);
});

test('TerritoryAdministrativeDataProvider: should update territory with geo', async t => {
  const input = [
    { territory_id: 1, name: "Test", code: "dont exits" },
    { territory_id: 1, name: "Test", code: "dont exits" },
    { territory_id: 1, name: "Test", code: "dont exits" },
  ];

  const result = await t.context.provider.updateTerritories(Level.Region, input);
  t.is(result.length, 2);
  t.is(Object.keys(result.find(r => name === 'Test')), ['name', 'code']);
});

test('TerritoryAdministrativeDataProvider: should ensure existing relation', async t => {
  const input = [
    { territory_id: 1 },
    { territory_id: 2 },
  ];

  const result = await t.context.provider.ensureRelation(1, input);
});

test('TerritoryAdministrativeDataProvider: should create relation', async t => {
  const input = [
    { territory_id: 1 },
    { territory_id: 2 },
  ];

  const result = await t.context.provider.ensureRelation(1, input);
});

test('TerritoryAdministrativeDataProvider: should ensure existing code', async t => {
  const input = [
    { territory_id: 1 },
    { territory_id: 2 },
  ];

  const result = await t.context.provider.ensureCode(1, input);
});

test('TerritoryAdministrativeDataProvider: should create code', async t => {
  const input = [
    { territory_id: 1 },
    { territory_id: 2 },
  ];

  const result = await t.context.provider.ensureCode(1, input);
});




