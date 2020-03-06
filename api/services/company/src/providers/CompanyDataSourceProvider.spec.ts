import test from 'ava';
import { NotFoundException } from '@ilos/common';

import { CompanyDataSourceProvider } from './CompanyDataSourceProvider';

test('should fetch from data source with a siret id', async (t) => {
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider();
  const data = await provider.find('12000101100010');
  t.deepEqual(Reflect.ownKeys(data), [
    'siret',
    'siren',
    'nic',
    'legal_name',
    'company_naf_code',
    'establishment_naf_code',
    'legal_nature_code',
    'legal_nature_label',
    'nonprofit_code',
    'intra_vat',
    'address',
    'lon',
    'lat',
    'headquarter',
    'updated_at',
  ]);

  t.is(data.siret, '12000101100010');
  t.is(data.siren, '120001011');
  t.is(data.nic, '00010');
  t.is(data.legal_name, 'SECRETARIAT GENERAL DU GOUVERNEMENT');
  t.is(data.company_naf_code, '8411Z');
  t.is(data.establishment_naf_code, '8411Z');
  t.is(data.legal_nature_code, '7120');
  t.is(data.legal_nature_label, "Service central d'un ministère");
  t.is(data.nonprofit_code, null);
  t.is(data.intra_vat, null);
  t.is(data.address, '57 Rue de Varenne 75007 Paris');
  t.is(data.lon, 2.320884);
  t.is(data.lat, 48.854634);
  t.is(data.headquarter, true);
  t.true(data.updated_at instanceof Date);
});

test('should fail with a wrong siret id', async (t) => {
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider();
  await t.throwsAsync<NotFoundException>(async () => provider.find('this_is_not_a_siret'));
});
