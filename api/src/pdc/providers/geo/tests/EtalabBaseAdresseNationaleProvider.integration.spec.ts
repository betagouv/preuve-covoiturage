import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';

import { EtalabBaseAdresseNationaleProvider } from '../providers/index.ts';
import { NotFoundException } from '@/ilos/common/index.ts';
import { insee, inseeError, geo, geoError } from './data.ts';

const provider = new EtalabBaseAdresseNationaleProvider();

it('EtalabBaseAdresseNationaleProvider: positionToInsee', async (t) => {
  assertEquals(await provider.positionToInsee(insee.position), insee.code);
});

it('EtalabBaseAdresseNationaleProvider: positionToInsee not found', async (t) => {
  await assertThrows(provider.positionToInsee(inseeError.position), { instanceOf: NotFoundException });
});

it('EtalabBaseAdresseNationaleProvider: literalToPosition', async (t) => {
  const { lat, lon } = await provider.literalToPosition(geo.literal);
  assertEquals(lon, geo.position.lon);
  assertEquals(lat, geo.position.lat);
});

it('EtalabBaseAdresseNationaleProvider: literalToPosition error', async (t) => {
  await assertThrows(provider.literalToPosition(geoError.literal), { instanceOf: NotFoundException });
});
