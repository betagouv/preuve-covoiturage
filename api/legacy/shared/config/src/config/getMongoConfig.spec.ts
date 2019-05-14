const { describe, it } = require('mocha');
const { expect } = require('chai');
const { getMongoConfig, getDatabase } = require('./getMongoConfig');

describe('getMongoConfig: starter plan', () => {
  const starter = {
    full:
      'mongodb://pdc-api-test-1234:Ya3bnd-NQIis96T2uQY@002b411d-2870-483f-9bc8-573a3b066dca.pdc-api-test-1234.mongo.dbs.scalingo.com:12345/pdc-api-test-1234?replicaSet=pdc-api-test-1234-rs0&ssl=true',
    host: '002b411d-2870-483f-9bc8-573a3b066dca.pdc-api-test-1234.mongo.dbs.scalingo.com',
    port: '12345',
    database: 'pdc-api-test-1234',
    password: 'Ya3bnd-NQIis96T2uQY',
  };

  const res = getMongoConfig(starter.full);

  it('host', () => {
    expect(res.host).to.equal(starter.host);
  });
  it('database', () => {
    expect(res.database).to.equal(starter.database);
  });
  it('password', () => {
    expect(res.password).to.equal(starter.password);
  });
});

describe('getMongoConfig: business plan', () => {
  const business = {
    full:
      'mongodb://pdc-api-test-4321:Ya3bnd-NQIis96T2uQY@002b411d-2870-483f-9bc8-573a3b066dca.pdc-api-test-4321.mongo.dbs.scalingo.com:12345,7addc974-d0e4-412b-814f-0ea15c8bb806.pdc-api-test-4321.mongo.dbs.scalingo.com:54321/pdc-api-test-4321?replicaSet=pdc-api-test-4321-rs0&ssl=true',
    host: '002b411d-2870-483f-9bc8-573a3b066dca.pdc-api-test-4321.mongo.dbs.scalingo.com',
    port: '12345',
    database: 'pdc-api-test-4321',
    password: 'Ya3bnd-NQIis96T2uQY',
  };

  const res = getMongoConfig(business.full);

  it('host', () => {
    expect(res.host).to.equal(business.host);
  });
  it('database', () => {
    expect(res.database).to.equal(business.database);
  });
  it('password', () => {
    expect(res.password).to.equal(business.password);
  });
});

describe('getDatabase', () => {
  it('starter plan', () => {
    expect(getDatabase('/pdc-api-test-4321')).to.equal('pdc-api-test-4321');
  });

  it('business plan', () => {
    expect(
      getDatabase(
        '/:12345,7addc974-d0e4-412b-814f-0ea15c8bb806.pdc-api-test-4321.mongo.dbs.scalingo.com/pdc-api-test-4321',
      ),
    ).to.equal('pdc-api-test-4321');
  });
});
