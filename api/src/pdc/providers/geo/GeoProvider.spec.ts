import { NotFoundException } from '@ilos/common/exceptions/NotFoundException';
import test from 'ava';
import sinon, { SinonStub } from 'sinon';
import { GeoProvider } from '.';
import { GeoInterface } from './interfaces/GeoInterface';
import { EtalabAPIGeoProvider, EtalabBaseAdresseNationaleProvider } from './providers';
import { LocalGeoProvider } from './providers/LocalGeoProvider';

let geoProvider: GeoProvider;

let localGeoProvider: LocalGeoProvider;
let etalabApiGeoProvider: EtalabAPIGeoProvider;
let etalabBANProvider: EtalabBaseAdresseNationaleProvider;

let localGeoProviderStub: SinonStub;

test.before((t) => {
  localGeoProvider = new LocalGeoProvider(null);
  etalabApiGeoProvider = new EtalabAPIGeoProvider();
  etalabBANProvider = new EtalabBaseAdresseNationaleProvider();
  geoProvider = new GeoProvider(etalabApiGeoProvider, etalabBANProvider, localGeoProvider, null);
});

test.afterEach((t) => {
  localGeoProviderStub.restore();
});

test('GeoProvider: should complete insee if null', async (t) => {
  localGeoProviderStub = sinon.stub(localGeoProvider, 'positionToInsee');
  localGeoProviderStub.resolves('65215');
  const end: GeoInterface = { lat: 43.69617, lon: 7.28949, geo_code: null };

  // Act
  const endGeoInterfaceResult: GeoInterface = await geoProvider.checkAndComplete(end);

  // Assert
  t.truthy(endGeoInterfaceResult.geo_code);
});

test('GeoProvider: should throw Error exception all 3 providers fails to find insee', async (t) => {
  // Arrange
  localGeoProviderStub.throws(new NotFoundException());
  sinon.stub(etalabApiGeoProvider, 'positionToInsee').throws(new NotFoundException());
  sinon.stub(etalabBANProvider, 'positionToInsee').throws(new NotFoundException());
  const end: GeoInterface = { lat: 43.72953, lon: 7.4166, geo_code: null };

  // Act  // Assert
  await t.throwsAsync(() => geoProvider.checkAndComplete(end), { instanceOf: Error });
});
