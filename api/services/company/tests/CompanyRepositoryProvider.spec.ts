import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
// import { describe } from 'mocha';

import { PostgresConnection } from '@ilos/connection-postgres';
import { CompanyRepositoryProvider } from '../src/providers/CompanyRepositoryProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const data = {
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

describe('Company repository provider', () => {
  const connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
  const provider: CompanyRepositoryProvider = new CompanyRepositoryProvider(connection);

  after(async () => {
    await connection.getClient().query({
      text: 'DELETE FROM company.companies WHERE siret = $1',
      values: [data.siret],
    });
  });

  it('should return undefined on unknow siret', async () => {
    const res = await provider.find('12000101100010');
    expect(res).to.be.undefined;
  });

  it('should insert data on db when siret not found', async () => {
    await provider.updateOrCreate(data);
    const res = await connection.getClient().query({
      text: `SELECT siren from company.companies WHERE siret = $1`,
      values: [data.siret],
    });
    expect(res.rows).to.be.an('array');
    expect(res.rows.length).to.eq(1);
    expect(res.rows[0].siren).to.eq(data.siren);
  });

  it('should update data if siret alread exists', async () => {
    await provider.updateOrCreate({
      ...data,
      headquarter: false,
    });

    const res = await connection.getClient().query({
      text: `SELECT headquarter, updated_at from company.companies WHERE siret = $1`,
      values: [data.siret],
    });
    expect(res.rows).to.be.an('array');
    expect(res.rows.length).to.eq(1);
    expect(res.rows[0].headquarter).to.eq(!data.headquarter);
    expect(res.rows[0].updated_at).to.be.greaterThan(data.updated_at);
  });

  it('should return a company on known siret', async () => {
    const res = await provider.find('12000101100010');
    expect(res).to.have.all.keys([
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

    expect(res.siret)
      .to.be.a('string')
      .that.eq(data.siret);
    expect(res.siren)
      .to.be.a('string')
      .that.eq(data.siren);
    expect(res.nic)
      .to.be.a('string')
      .that.eq(data.nic);
    expect(res.legal_name)
      .to.be.a('string')
      .that.eq(data.legal_name);
    expect(res.company_naf_code)
      .to.be.a('string')
      .that.eq(data.company_naf_code);
    expect(res.establishment_naf_code)
      .to.be.a('string')
      .that.eq(data.establishment_naf_code);
    expect(res.legal_nature_code)
      .to.be.a('string')
      .that.eq(data.legal_nature_code);
    expect(res.legal_nature_label)
      .to.be.a('string')
      .that.eq(data.legal_nature_label);
    expect(res.nonprofit_code).to.be.null;
    expect(res.intra_vat).to.be.null; // FIXME
    expect(res.address)
      .to.be.a('string')
      .that.eq(data.address);
    expect(res.lon)
      .to.be.a('number')
      .that.eq(data.lon);
    expect(res.lat)
      .to.be.a('number')
      .that.eq(data.lat);
    expect(res.headquarter)
      .to.be.a('boolean')
      .that.eq(!true);
    expect(res.updated_at).to.be.a('date');
  });
});
