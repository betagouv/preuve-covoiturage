import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { LocalGeoProvider } from '../src/providers';
import { insee, inseeForeign, inseeError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('LocalGeoProvider', () => {
  const connection: PostgresConnection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });

  before(async () => {
    await connection.up();
  });

  after(async () => {
    await connection.down();
  });

  it('should work with local', async () => {
    const provider = new LocalGeoProvider(connection);
    const result = await provider.positionToInsee(insee.position);
    expect(result).to.eq(insee.code);
  });

  it('should work with foreign', async () => {
    const provider = new LocalGeoProvider(connection);
    const result = await provider.positionToInsee(inseeForeign.position);
    expect(result).to.eq(inseeForeign.code);
  });

  it('should raise error if not found', async () => {
    const provider = new LocalGeoProvider(connection);
    await expect(provider.positionToInsee(inseeError.position)).to.rejectedWith(NotFoundException);
  });
});
