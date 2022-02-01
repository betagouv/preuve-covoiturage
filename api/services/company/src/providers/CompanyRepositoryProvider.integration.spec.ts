import anyTest, { TestFn } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CompanyRepositoryProvider } from './CompanyRepositoryProvider';
import { CompanyInterface } from '../shared/common/interfaces/CompanyInterface2';

interface RepositoryTestFn {
  connection: PostgresConnection;
  repository: CompanyRepositoryProvider;
  data: CompanyInterface;
}

const test = anyTest as TestFn<RepositoryTestFn>;

test.before.skip(async (t) => {
  t.context.data = {
    siret: '12000101100010',
    siren: '120001011',
    nic: '00010',
    legal_name: 'SECRETARIAT GENERAL DU GOUVERNEMENT',
    company_naf_code: '8411Z',
    establishment_naf_code: '8411Z',
    legal_nature_code: '7120',
    legal_nature_label: "Service central d'un ministère",
    nonprofit_code: null,
    intra_vat: null,
    address: '57 Rue de Varenne 75007 Paris',
    lon: 2.320884,
    lat: 48.854634,
    headquarter: true,
    updated_at: new Date('2019-11-07T12:34:53.000Z'),
  };
  t.context.connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  await t.context.connection.up();
  t.context.repository = new CompanyRepositoryProvider(t.context.connection);
});

test.after.always.skip(async (t) => {
  await t.context.connection.getClient().query({
    text: 'DELETE FROM company.companies WHERE siret = $1',
    values: [t.context.data.siret],
  });
  await t.context.connection.down();
});

test.serial.skip('should return undefined on unknow siret', async (t) => {
  const res = await t.context.repository.findBySiret('12000101100010');
  t.is(res, undefined);
});

test.serial.skip('should insert data on db when siret not found', async (t) => {
  await t.context.repository.updateOrCreate(t.context.data);
  const res = await t.context.connection.getClient().query({
    text: `SELECT siren from company.companies WHERE siret = $1`,
    values: [t.context.data.siret],
  });
  t.true(Array.isArray(res.rows));
  t.is(res.rows.length, 1);
  t.is(res.rows[0].siren, t.context.data.siren);
});

test.serial.skip('should update data if siret alread exists', async (t) => {
  await t.context.repository.updateOrCreate({
    ...t.context.data,
    headquarter: false,
  });

  const res = await t.context.connection.getClient().query({
    text: `SELECT headquarter, updated_at from company.companies WHERE siret = $1`,
    values: [t.context.data.siret],
  });
  t.true(Array.isArray(res.rows));
  t.is(res.rows.length, 1);
  t.is(res.rows[0].headquarter, !t.context.data.headquarter);
  t.true(res.rows[0].updated_at > t.context.data.updated_at);
});

test.serial.skip('should return a company on known siret', async (t) => {
  const res = await t.context.repository.findBySiret('12000101100010');
  t.true(typeof res === 'object');
  t.deepEqual(
    Reflect.ownKeys(res).sort(),
    [
      '_id',
      'siret',
      'siren',
      'nic',
      'legal_name',
      'company_naf_code',
      'establishment_naf_code',
      'legal_nature_code',
      'legal_nature_label',
      'intra_vat',
      'headquarter',
      'updated_at',
      'nonprofit_code',
      'address',
      'address_street',
      'address_postcode',
      'address_cedex',
      'address_city',
      'lat',
      'lon',
    ].sort(),
  );

  t.is(res.siret, t.context.data.siret);
  t.is(res.siren, t.context.data.siren);
  t.is(res.nic, t.context.data.nic);
  t.is(res.legal_name, t.context.data.legal_name);
  t.is(res.company_naf_code, t.context.data.company_naf_code);
  t.is(res.establishment_naf_code, t.context.data.establishment_naf_code);
  t.is(res.legal_nature_code, t.context.data.legal_nature_code);
  t.is(res.legal_nature_label, t.context.data.legal_nature_label);
  t.is(res.nonprofit_code, null);
  t.is(res.intra_vat, null);
  t.is(res.address, t.context.data.address);
  t.is(res.lon, t.context.data.lon);
  t.is(res.lat, t.context.data.lat);
  t.is(res.headquarter, !true);
  t.true(res.updated_at instanceof Date);
});
