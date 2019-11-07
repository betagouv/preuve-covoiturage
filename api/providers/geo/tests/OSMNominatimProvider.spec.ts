import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { OSMNominatimProvider } from '../src/providers';
import { NotFoundException } from '@ilos/common';
import { geo, geoError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('OSMNominatimProvider', () => {
  it('should work', async () => {
    const provider = new OSMNominatimProvider();
    const { lat, lon } = await provider.toPosition(geo.literal);
    expect(lat).to.be.closeTo(geo.position.lat, 0.003);
    expect(lon).to.be.closeTo(geo.position.lon, 0.003);
  });

  it('should raise error if not found', async () => {
    const provider = new OSMNominatimProvider();
    await expect(provider.toPosition(geoError.literal)).to.rejectedWith(NotFoundException)
  });
});
