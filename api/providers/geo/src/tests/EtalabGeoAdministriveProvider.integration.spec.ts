import test from 'ava';

import { EtalabGeoAdministriveProvider } from '../providers';
import { NotFoundException } from '@ilos/common';
import { insee, inseeError, inseeGeo, inseeGeoError } from './data';

const provider = new EtalabGeoAdministriveProvider();

test('EtalabGeoAdministriveProvider: positionToInsee', async (t) => {
  t.is(await provider.positionToInsee(insee.position), insee.code);
});

test('EtalabGeoAdministriveProvider: positionToInsee not found', async (t) => {
  await t.throwsAsync(provider.positionToInsee(inseeError.position), { instanceOf: NotFoundException });
});

test('EtalabGeoAdministriveProvider: inseeToPosition', async (t) => {
  const { lat, lon } = await provider.inseeToPosition(inseeGeo.code);
  t.is(lon, inseeGeo.position.lon);
  t.is(lat, inseeGeo.position.lat);
});

test('EtalabGeoAdministriveProvider: inseeToPosition error', async (t) => {
  await t.throwsAsync(provider.inseeToPosition(inseeGeoError.code), { instanceOf: NotFoundException });
});
