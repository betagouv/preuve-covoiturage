import anyTest, { TestFn } from 'ava';

import { NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { LocalGeoProvider } from '../providers';
import { insee, inseeForeign, inseeError } from './data';

const test = anyTest as TestFn<{
  connection: PostgresConnection;
  provider: LocalGeoProvider;
}>;

test.before.skip(async (t) => {
  t.context.connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await t.context.connection.up();
  t.context.provider = new LocalGeoProvider(t.context.connection);
});

test.after.skip(async (t) => {
  await t.context.connection.down();
});

test.skip('LocalGeoProvider: positionToInsee', async (t) => {
  t.is(await t.context.provider.positionToInsee(insee.position), insee.code);
});

test.skip('LocalGeoProvider: positionToInsee foreign', async (t) => {
  t.is(await t.context.provider.positionToInsee(inseeForeign.position), inseeForeign.code);
});

test.skip('LocalGeoProvider: positionToInsee error', async (t) => {
  await t.throwsAsync(t.context.provider.positionToInsee(inseeError.position), { instanceOf: NotFoundException });
});
