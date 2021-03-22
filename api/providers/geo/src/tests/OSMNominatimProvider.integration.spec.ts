import test from 'ava';

import { OSMNominatimProvider } from '../providers';
import { NotFoundException } from '@ilos/common';
import { geoNominatim, geoError } from './data';

const provider = new OSMNominatimProvider();

test('OSMNominatimProvider: inseeToPosition', async (t) => {
  const { lat, lon } = await provider.literalToPosition(geoNominatim.literal);
  t.is(lon, geoNominatim.position.lon);
  t.is(lat, geoNominatim.position.lat);
});

test('OSMNominatimProvider: inseeToPosition error', async (t) => {
  await t.throwsAsync(provider.literalToPosition(geoError.literal), { instanceOf: NotFoundException });
});
