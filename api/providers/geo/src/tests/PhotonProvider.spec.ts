import test from 'ava';

import { PhotonProvider } from '../providers';
import { NotFoundException } from '@ilos/common';
import { geoNominatim, geoError } from './data';

const provider = new PhotonProvider();

test('PhotonProvider: inseeToPosition', async (t) => {
  const { lat, lon } = await provider.literalToPosition(geoNominatim.literal);
  t.is(lon, geoNominatim.position.lon);
  t.is(lat, geoNominatim.position.lat);
});

test('PhotonProvider: inseeToPosition error', async (t) => {
  await t.throwsAsync(provider.literalToPosition(geoError.literal), { instanceOf: NotFoundException });
});
