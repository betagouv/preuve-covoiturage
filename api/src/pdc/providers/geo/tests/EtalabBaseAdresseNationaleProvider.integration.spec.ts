import test from 'ava';

import { EtalabBaseAdresseNationaleProvider } from '../providers/index.ts';
import { NotFoundException } from '@/ilos/common/index.ts';
import { insee, inseeError, geo, geoError } from './data.ts';

const provider = new EtalabBaseAdresseNationaleProvider();

test('EtalabBaseAdresseNationaleProvider: positionToInsee', async (t) => {
  t.is(await provider.positionToInsee(insee.position), insee.code);
});

test('EtalabBaseAdresseNationaleProvider: positionToInsee not found', async (t) => {
  await t.throwsAsync(provider.positionToInsee(inseeError.position), { instanceOf: NotFoundException });
});

test('EtalabBaseAdresseNationaleProvider: literalToPosition', async (t) => {
  const { lat, lon } = await provider.literalToPosition(geo.literal);
  t.is(lon, geo.position.lon);
  t.is(lat, geo.position.lat);
});

test('EtalabBaseAdresseNationaleProvider: literalToPosition error', async (t) => {
  await t.throwsAsync(provider.literalToPosition(geoError.literal), { instanceOf: NotFoundException });
});
