import { describe } from 'mocha';
import chaiAsPromised from 'chai-as-promised';
import chai from 'chai';
import { PhotonProvider } from '../src/providers';
import { NotFoundException } from '@ilos/common';
import { geo, geoError } from './data';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('PhotonProvider', () => {
  it('should work', async () => {
    const provider = new PhotonProvider();
    const { lat, lon } = await provider.literalToPosition(geo.literal);
    expect(lat).to.be.closeTo(geo.position.lat, 0.003);
    expect(lon).to.be.closeTo(geo.position.lon, 0.003);
  });

  it('should raise error if not found', async () => {
    const provider = new PhotonProvider();
    await expect(provider.literalToPosition(geoError.literal)).to.rejectedWith(NotFoundException)
  });
});
