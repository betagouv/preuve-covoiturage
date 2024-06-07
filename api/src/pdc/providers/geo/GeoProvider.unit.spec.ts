import { NotFoundException } from '@/ilos/common/exceptions/NotFoundException.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { GeoProvider } from './index.ts';
import { GeoInterface } from './interfaces/GeoInterface.ts';
import { EtalabAPIGeoProvider, EtalabBaseAdresseNationaleProvider } from './providers/index.ts';
import { LocalGeoProvider } from './providers/LocalGeoProvider.ts';

let geoProvider: GeoProvider;

let localGeoProvider: LocalGeoProvider;
let etalabApiGeoProvider: EtalabAPIGeoProvider;
let etalabBANProvider: EtalabBaseAdresseNationaleProvider;

let localGeoProviderStub: SinonStub;

beforeAll((t) => {
  localGeoProvider = new LocalGeoProvider(null);
  etalabApiGeoProvider = new EtalabAPIGeoProvider();
  etalabBANProvider = new EtalabBaseAdresseNationaleProvider();
  geoProvider = new GeoProvider(etalabApiGeoProvider, etalabBANProvider, localGeoProvider, null);
});

afterEach((t) => {
  localGeoProviderStub.restore();
});

it('GeoProvider: should complete insee if null', async (t) => {
  localGeoProviderStub = sinon.stub(localGeoProvider, 'positionToInsee');
  localGeoProviderStub.resolves('65215');
  const end: GeoInterface = { lat: 43.69617, lon: 7.28949, geo_code: null };

  // Act
  const endGeoInterfaceResult: GeoInterface = await geoProvider.checkAndComplete(end);

  // Assert
  t.truthy(endGeoInterfaceResult.geo_code);
});

it('GeoProvider: should throw Error exception all 3 providers fails to find insee', async (t) => {
  // Arrange
  localGeoProviderStub.throws(new NotFoundException());
  sinon.stub(etalabApiGeoProvider, 'positionToInsee').throws(new NotFoundException());
  sinon.stub(etalabBANProvider, 'positionToInsee').throws(new NotFoundException());
  const end: GeoInterface = { lat: 43.72953, lon: 7.4166, geo_code: null };

  // Act  // Assert
  await assertThrows(() => geoProvider.checkAndComplete(end), { instanceOf: Error });
});
