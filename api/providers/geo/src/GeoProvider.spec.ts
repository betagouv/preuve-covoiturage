import { strict as assert } from 'assert';

import { GeoProvider } from './GeoProvider';

async function assertThrows(errorType, func, ...args) {
  try {
    await func(...args);
    throw new Error('Does not throw error');
  } catch (e) {
    if (typeof errorType === 'string') {
      assert.equal(errorType, e && e.message ? e.message : null);
    } else {
      assert(e instanceof errorType, e ? `[${e.name}] ${e.message}` : null);
    }
  }
}

const geoProvider = new GeoProvider();

// TOWN
describe('find Town common', () => {
  it('missing args', () => assertThrows(TypeError, geoProvider.getTown));
  // it('empty object', () => assertThrows(BadRequestError, town, {}));
  // it('wrong props', () =>
  //   assertThrows(BadRequestError, town, { hello: 'world' }));
  // it('null props', () =>
  //   assertThrows(BadRequestError, town, {
  //     lon: null,
  //     lat: null,
  //     insee: null,
  //     literal: null,
  //   }));
  // it('undefined props', () =>
  //   assertThrows(BadRequestError, town, {
  //     lon: undefined,
  //     lat: undefined,
  //     insee: undefined,
  //     literal: undefined,
  //   }));
});

describe('find Town by INSEE', () => {
  // it('wrong INSEE format', () =>
  //   assertThrows('FormatError', geoProvider.getTown, { insee: '75' }));
  // it('null INSEE', () => assertThrows(BadRequestError, town, { insee: null }));
  it('non-existing code', async () => assert.equal((await geoProvider.getTown({ insee: '00000' })).insee, null));
  it('Same INSEE code', async () => assert.equal((await geoProvider.getTown({ insee: '69123' })).insee, '69123'));
});

describe('find Town by lon/lat', () => {
  // it('wrong lat format : ABC', () =>
  //   assertThrows('FormatError', geoProvider.getTown, { lat: 'ABC', lon: 1 }));
  // it('wrong lat format : 75A', () =>
  //   assertThrows('FormatError', geoProvider.getTown, { lat: '75A', lon: 1 }));
  // it('wrong range too low', () =>
  //   assertThrows('lat must be between -90 and 90', geoProvider.getTown, { lat: -91, lon: 1 }));
  // it('wrong range too high', () =>
  //   assertThrows('lat must be between -90 and 90', geoProvider.getTown, { lat: 91, lon: 1 }));

  it('Found KB', async () =>
    assert.deepStrictEqual(await geoProvider.getTown({ lon: 2.3497, lat: 48.8032 }), {
      lon: 2.3497,
      lat: 48.8032,
      country: 'France',
      insee: '94043',
      town: 'Le Kremlin-Bicêtre',
      postcodes: ['94270'],
    }));
  it('Found Marseille', async () =>
    assert.deepStrictEqual(await geoProvider.getTown({ lon: 5.3682, lat: 43.2392 }), {
      lon: 5.3682,
      lat: 43.2392,
      country: 'France',
      insee: '13208',
      town: 'Marseille',
      postcodes: ['13008'],
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await geoProvider.getTown({ lon: 180, lat: 90 }), {
      lon: 180,
      lat: 90,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await geoProvider.getTown({ lon: 180, lat: 89 }), {
      lon: 180,
      lat: 89,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await geoProvider.getTown({ lon: 0, lat: 0 }), {
      lon: 0,
      lat: 0,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
});
