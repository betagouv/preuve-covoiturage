import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { EtalabGeoAdministriveProvider } from '../src/providers';
import { NotFoundException } from '@ilos/common';
import { insee, inseeError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('EtalabGeoAdministriveProvider', () => {
  it('should work', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    const result = await provider.toInsee(insee.position);
    expect(result).to.eq(insee.code);
  });

  it('should raise error if not found', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    await expect(provider.toInsee(inseeError.position)).to.rejectedWith(NotFoundException)
  });
});
