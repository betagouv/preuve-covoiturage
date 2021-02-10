import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';
import { TerritoryProvider } from './TerritoryProvider';

interface TestContext {
  connection: PostgresConnection;
  provider: TerritoryProvider;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await t.context.connection.up();
  t.context.provider = new TerritoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  await t.context.connection.down();
});

// IDFM
test('INSEE: Paris (whole)', async (t) => t.is(await t.context.provider.findByInsee('75056'), 239));
test('INSEE: Paris 13', async (t) => t.is(await t.context.provider.findByInsee('75113'), 239));
test('INSEE: Créteil', async (t) => t.is(await t.context.provider.findByInsee('94028'), 239));
test('INSEE: Dourdan', async (t) => t.is(await t.context.provider.findByInsee('91200'), 239));
test('Point: Paris 13', async (t) => t.is(await t.context.provider.findByPoint({ lon: 2.35763, lat: 48.825556 }), 239));
test('Point: Créteil', async (t) => t.is(await t.context.provider.findByPoint({ lon: 2.45291, lat: 48.782445 }), 239));
test('Point: Dourdan', async (t) => t.is(await t.context.provider.findByPoint({ lon: 1.997318, lat: 48.543592 }), 239));

// Arles, Crau...
test('INSEE: Saint-Pierre-de-Mézoargues', async (t) => t.is(await t.context.provider.findByInsee('13061'), 21));
test('Point: Saint-Pierre-de-Mézoargues', async (t) =>
  t.is(await t.context.provider.findByPoint({ lon: 4.658437, lat: 43.860243 }), 21));

// Alençon
test('INSEE: Fontenai-les-Louvets', async (t) => t.is(await t.context.provider.findByInsee('61172'), 9));
test('Point: Fontenai-les-Louvets', async (t) =>
  t.is(await t.context.provider.findByPoint({ lon: 0.007731, lat: 48.527366 }), 9));
