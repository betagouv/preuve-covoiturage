const assert = require('assert');
const mongoose = require('mongoose');
const assertThrows = require('@pdc/shared/test/lib/assert-throws');
const BadRequestError = require('@pdc/shared/errors/bad-request');

const { aom, postcodes, town } = require('../geo');

// AOM
describe('find AOM common', () => {
  it('missing args', () => assertThrows(TypeError, aom));
  it('empty object', () => assertThrows(BadRequestError, aom, {}));
  it('wrong props', () =>
    assertThrows(BadRequestError, aom, { hello: 'world' }));
});

describe('find AOM by INSEE', () => {
  it('wrong INSEE format', () =>
    assertThrows('FormatError', aom, { insee: '75' }));
  it('null INSEE', () => assertThrows(BadRequestError, aom, { insee: null }));
  it('undefined INSEE', () =>
    assertThrows(BadRequestError, aom, { insee: undefined }));
  it('non-existing code', async () =>
    assert.equal(await aom({ insee: '00000' }), null));
  it('mongoose.Document', async () =>
    assert((await aom({ insee: '75056' })) instanceof mongoose.Document));
  it('Same INSEE code', async () =>
    assert.equal((await aom({ insee: '75056' })).insee_main, '75056'));
});

describe('find AOM by lon/lat', () => {
  it('wrong lat format : ABC', () =>
    assertThrows('FormatError', aom, { lat: 'ABC', lon: 1 }));
  it('wrong lat format : 75A', () =>
    assertThrows('FormatError', aom, { lat: '75A', lon: 1 }));
  it('wrong range too low', () =>
    assertThrows('lat must be between -90 and 90', aom, { lat: -91, lon: 1 }));
  it('wrong range too high', () =>
    assertThrows('lat must be between -90 and 90', aom, { lat: 91, lon: 1 }));

  it('Found Paris', async () =>
    assert(
      (await aom({ lon: 2.3497, lat: 48.8032 })) instanceof mongoose.Document,
    ));
  it('Found Marseille', async () =>
    assert(
      (await aom({ lon: 5.3682, lat: 43.2392 })) instanceof mongoose.Document,
    ));
  it('Not Found', async () =>
    assert.equal(await aom({ lon: 180, lat: 90 }), null));
});

// POSTCODES
describe('Postcodes :: common errors', () => {
  it('missing args', () => assertThrows(TypeError, postcodes));
  it('empty object', () => assertThrows(BadRequestError, postcodes, {}));
  it('wrong props', () =>
    assertThrows(BadRequestError, postcodes, { hello: 'world' }));
  it('null props', () =>
    assertThrows(BadRequestError, postcodes, {
      lon: null,
      lat: null,
      insee: null,
      literal: null,
    }));
  it('undefined props', () =>
    assertThrows(BadRequestError, postcodes, {
      lon: undefined,
      lat: undefined,
      insee: undefined,
      literal: undefined,
    }));
});

describe('Postcodes :: lon/lat', () => {
  it('Ste-Genevieve-des-Bois', async () =>
    assert.deepEqual(await postcodes({ lon: 2.34108, lat: 48.62507 }), [
      '91700',
    ]));
  it('Geneva', async () =>
    assert.deepEqual(await postcodes({ lat: 46.21002, lon: 6.14349 }), [
      '1201',
    ]));
  it('Marcellaz', async () =>
    assert.deepEqual(await postcodes({ lat: 46.15137, lon: 6.3562 }), [
      '74250',
    ]));
});

// TOWN
describe('find Town common', () => {
  it('missing args', () => assertThrows(TypeError, town));
  it('empty object', () => assertThrows(BadRequestError, town, {}));
  it('wrong props', () =>
    assertThrows(BadRequestError, town, { hello: 'world' }));
  it('null props', () =>
    assertThrows(BadRequestError, town, {
      lon: null,
      lat: null,
      insee: null,
      literal: null,
    }));
  it('undefined props', () =>
    assertThrows(BadRequestError, town, {
      lon: undefined,
      lat: undefined,
      insee: undefined,
      literal: undefined,
    }));
});

describe('find Town by INSEE', () => {
  it('wrong INSEE format', () =>
    assertThrows('FormatError', town, { insee: '75' }));
  it('null INSEE', () => assertThrows(BadRequestError, town, { insee: null }));
  it('undefined INSEE', () =>
    assertThrows(BadRequestError, town, { insee: undefined }));
  it('non-existing code', async () =>
    assert.equal((await town({ insee: '00000' })).insee, null));
  it('Same INSEE code', async () =>
    assert.equal((await town({ insee: '69123' })).insee, '69123'));
});

describe('find Town by lon/lat', () => {
  it('wrong lat format : ABC', () =>
    assertThrows('FormatError', town, { lat: 'ABC', lon: 1 }));
  it('wrong lat format : 75A', () =>
    assertThrows('FormatError', town, { lat: '75A', lon: 1 }));
  it('wrong range too low', () =>
    assertThrows('lat must be between -90 and 90', town, { lat: -91, lon: 1 }));
  it('wrong range too high', () =>
    assertThrows('lat must be between -90 and 90', town, { lat: 91, lon: 1 }));

  it('Found KB', async () =>
    assert.deepStrictEqual(await town({ lon: 2.3497, lat: 48.8032 }), {
      lon: 2.3497,
      lat: 48.8032,
      country: 'France',
      insee: '94043',
      town: 'Le Kremlin-Bicêtre',
      postcodes: ['94270'],
    }));
  it('Found Marseille', async () =>
    assert.deepStrictEqual(await town({ lon: 5.3682, lat: 43.2392 }), {
      lon: 5.3682,
      lat: 43.2392,
      country: 'France',
      insee: '13208',
      town: 'Marseille',
      postcodes: ['13008'],
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await town({ lon: 180, lat: 90 }), {
      lon: 180,
      lat: 90,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await town({ lon: 180, lat: 89 }), {
      lon: 180,
      lat: 89,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
  it('Not Found', async () =>
    assert.deepStrictEqual(await town({ lon: 0, lat: 0 }), {
      lon: 0,
      lat: 0,
      insee: null,
      town: null,
      postcodes: [],
      country: null,
    }));
});
