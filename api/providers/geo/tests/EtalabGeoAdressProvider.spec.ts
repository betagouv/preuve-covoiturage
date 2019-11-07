import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { EtalabGeoAdressProvider } from '../src/providers';
import { NotFoundException } from '@ilos/common';
import { insee, inseeError, geo, geoError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('EtalabGeoAdressProvider', () => {
  it('insee should work', async () => {
    const provider = new EtalabGeoAdressProvider();
    const result = await provider.toInsee(insee.position);
    expect(result).to.eq(insee.code);
  });

  it('insee should raise error if not found', async () => {
    const provider = new EtalabGeoAdressProvider();
    await expect(provider.toInsee(inseeError.position)).to.rejectedWith(NotFoundException)
  });

  it('geo should work', async () => {
    const provider = new EtalabGeoAdressProvider();
    const { lat, lon } = await provider.toPosition(geo.literal);
    expect(lat).to.be.closeTo(geo.position.lat, 0.003);
    expect(lon).to.be.closeTo(geo.position.lon, 0.003);
  });

  it('geo should raise error if not found', async () => {
    const provider = new EtalabGeoAdressProvider();
    await expect(provider.toPosition(geoError.literal)).to.rejectedWith(NotFoundException)
  });
});
