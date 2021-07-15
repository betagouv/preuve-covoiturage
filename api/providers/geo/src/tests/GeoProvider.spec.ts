import test from 'ava';
import sinon, { SinonStub } from 'sinon';
import { GeoProvider } from '..';
import { NotFoundException } from '../../../../ilos/common/src/exceptions/NotFoundException';
import { GeoInterface } from '../interfaces/GeoInterface';
import { EtalabGeoAdministriveProvider, EtalabGeoAdressProvider } from '../providers';
import { LocalGeoProvider } from '../providers/LocalGeoProvider';

let geoProvider: GeoProvider;

let localGeoProvider: LocalGeoProvider;
let etalabGeoAdministriveProvider: EtalabGeoAdministriveProvider;
let etalabGeoAdressProvider: EtalabGeoAdressProvider;

let localGeoProviderStub: SinonStub;

test.before((t) => {
  localGeoProvider = new LocalGeoProvider(null);
  etalabGeoAdministriveProvider = new EtalabGeoAdministriveProvider();
  etalabGeoAdressProvider = new EtalabGeoAdressProvider();
  geoProvider = new GeoProvider(
    etalabGeoAdministriveProvider,
    etalabGeoAdressProvider,
    null,
    localGeoProvider,
    null,
    null,
    null,
  );
});

test.afterEach((t) => {
  localGeoProviderStub.restore();
});

test('GeoProvider: should complete insee if null', async (t) => {
  localGeoProviderStub = sinon.stub(localGeoProvider, 'positionToInsee');
  localGeoProviderStub.resolves('65215');
  const end: GeoInterface = { lat: 43.69617, lon: 7.28949, insee: null };

  // Act
  const endGeoInterfaceResult: GeoInterface = await geoProvider.checkAndComplete(end);

  // Assert
  t.truthy(endGeoInterfaceResult.insee);
});

test('GeoProvider: should throw Error exception all 3 providers fails to find insee', async (t) => {
  // Arrange
  localGeoProviderStub.throws(new NotFoundException());
  sinon.stub(etalabGeoAdministriveProvider, 'positionToInsee').throws(new NotFoundException());
  sinon.stub(etalabGeoAdressProvider, 'positionToInsee').throws(new NotFoundException());
  const end: GeoInterface = { lat: 43.72953, lon: 7.4166, insee: null };

  // Act
  const error = await t.throwsAsync(() => geoProvider.checkAndComplete(end));

  // Assert
  t.truthy(error instanceof Error);
});
