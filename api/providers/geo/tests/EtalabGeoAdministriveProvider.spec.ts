import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { EtalabGeoAdministriveProvider } from '../src/providers';
import { NotFoundException } from '@ilos/common';
import { insee, inseeError, inseeGeo, inseeGeoError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('EtalabGeoAdministriveProvider', () => {
  it('should work', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    const result = await provider.positionToInsee(insee.position);
    expect(result).to.eq(insee.code);
  });

  it('should raise error if not found', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    await expect(provider.positionToInsee(inseeError.position)).to.rejectedWith(NotFoundException)
  });

  it('geo should work', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    const { lat, lon } = await provider.inseeToPosition(inseeGeo.code);
    expect(lat).to.be.closeTo(inseeGeo.position.lat, 0.003);
    expect(lon).to.be.closeTo(inseeGeo.position.lon, 0.003);
  });

  it('geo should raise error if not found', async () => {
    const provider = new EtalabGeoAdministriveProvider();
    await expect(provider.inseeToPosition(inseeGeoError.code)).to.rejectedWith(NotFoundException)
  });
});
