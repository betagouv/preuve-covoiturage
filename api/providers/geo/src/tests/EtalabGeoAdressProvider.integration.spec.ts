import test from 'ava';

import { EtalabGeoAdressProvider } from '../providers';
import { NotFoundException } from '@ilos/common';
import { insee, inseeError, geo, geoError } from './data';

const provider = new EtalabGeoAdressProvider();

test('EtalabGeoAdministriveProvider: positionToInsee', async (t) => {
  t.is(await provider.positionToInsee(insee.position), insee.code);
});

test('EtalabGeoAdministriveProvider: positionToInsee not found', async (t) => {
  await t.throwsAsync(provider.positionToInsee(inseeError.position), { instanceOf: NotFoundException });
});

test('EtalabGeoAdministriveProvider: literalToPosition', async (t) => {
  const { lat, lon } = await provider.literalToPosition(geo.literal);
  t.is(lon, geo.position.lon);
  t.is(lat, geo.position.lat);
});

test('EtalabGeoAdministriveProvider: literalToPosition error', async (t) => {
  await t.throwsAsync(provider.literalToPosition(geoError.literal), { instanceOf: NotFoundException });
});
