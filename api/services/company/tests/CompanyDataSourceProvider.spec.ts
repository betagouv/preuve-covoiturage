import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// import { describe } from 'mocha';
import { NotFoundException } from '@ilos/common';

import { CompanyDataSourceProvider } from '../src/providers/CompanyDataSourceProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Company data source provider', () => {
  let provider: CompanyDataSourceProvider = new CompanyDataSourceProvider();
  it('should fetch from data source with a siret id', async () => {
    const data = await provider.find('12000101100010');
    expect(data).to.have.all.keys([
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

    expect(data.siret).to.be.a('string').that.eq('12000101100010');
    expect(data.siren).to.be.a('string').that.eq('120001011');
    expect(data.nic).to.be.a('string').that.eq('00010');
    expect(data.legal_name).to.be.a('string').that.eq('SECRETARIAT GENERAL DU GOUVERNEMENT');
    expect(data.company_naf_code).to.be.a('string').that.eq('8411Z');
    expect(data.establishment_naf_code).to.be.a('string').that.eq('8411Z');
    expect(data.legal_nature_code).to.be.a('string').that.eq('7120');
    expect(data.legal_nature_label).to.be.a('string').that.eq("Service central d'un ministère");
    expect(data.nonprofit_code).to.be.null;
    expect(data.intra_vat).to.be.null; // FIXME
    expect(data.address).to.be.a('string').that.eq('57 Rue de Varenne 75007 Paris');
    expect(data.lon).to.be.a('number').that.eq(2.320884);
    expect(data.lat).to.be.a('number').that.eq(48.854634);
    expect(data.headquarter).to.be.a('boolean').that.eq(true);
    expect(data.updated_at).to.be.a('date');
  });

  it('should fail with a wrong siret id', async () => {
    await expect(provider.find('this_is_not_a_siret')).to.rejectedWith(NotFoundException)
  });
});
