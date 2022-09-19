import test from 'ava';
import { NotFoundException } from '@ilos/common';

import { CompanyDataSourceProvider } from './CompanyDataSourceProvider';
import { Extensions } from '@ilos/core';
import * as dataSource from '../config/dataSource';

test('should fetch from data source with a siret id', async (t) => {
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider(new Extensions.ConfigStore({
    dataSource
  }));
  const data = await provider.find('12000101100010');

  t.is(data.siret, '12000101100010');
  t.is(data.siren, '120001011');
  t.is(data.nic, '00010');
  t.is(data.legal_name, 'SECRETARIAT GENERAL DU GOUVERNEMENT');
  t.is(data.company_naf_code, '8411Z');
  t.is(data.establishment_naf_code, '8411Z');
  t.is(data.legal_nature_code, '7120');
  // t.is(data.legal_nature_label, 'SECRETARIAT GENERAL DU GOUVERNEMENT');
  t.is(data.intra_vat, 'FR58120001011');
  t.is(data.address, '57 RUE DE VARENNE 75007 PARIS 7');
  // t.is(data.lon, 2.320884);
  // t.is(data.lat, 48.854634);
  t.is(data.headquarter, true);
  t.true(data.updated_at instanceof Date);
});

test('should fail with a wrong siret id', async (t) => {
  const provider: CompanyDataSourceProvider = new CompanyDataSourceProvider(new Extensions.ConfigStore({
    dataSource
  }));
  await t.throwsAsync<NotFoundException>(async () => provider.find('this_is_not_a_siret'));
});
