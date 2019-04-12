/* eslint-disable max-len */
const assert = require('assert');
const assertThrows = require('@pdc/shared/test/lib/assert-throws');
// const NotFoundError = require('../../../src/packages/errors/not-found');
const BadRequestError = require('@pdc/shared/errors/bad-request');

const { postcodes } = require('@pdc/package-geo/geo');

describe('Postcodes :: common errors', () => {
  it('missing args', () => assertThrows(TypeError, postcodes));
  it('empty object', () => assertThrows(BadRequestError, postcodes, {}));
  it('wrong props', () => assertThrows(BadRequestError, postcodes, { hello: 'world' }));
  it('null props', () => assertThrows(BadRequestError, postcodes, { lon: null, lat: null, insee: null, literal: null }));
  it('undefined props', () => assertThrows(BadRequestError, postcodes, { lon: undefined, lat: undefined, insee: undefined, literal: undefined }));
});

// describe('Postcodes :: INSEE', () => {
//   it('wrong INSEE format', () => assertThrows('FormatError', town, { insee: '75' }));
//   it('null INSEE', () => assertThrows(BadRequestError, town, { insee: null }));
//   it('undefined INSEE', () => assertThrows(BadRequestError, town, { insee: undefined }));
//   it('non-existing code', async () => assertThrows(NotFoundError, town, { insee: '00000' }));
//   it('Same INSEE code', async () => assert.equal((await town({ insee: '69008' })).insee, '69008'));
// });

describe('Postcodes :: lon/lat', () => {
  // it('wrong lat format : ABC', () => assertThrows('FormatError', postcodes, { lat: 'ABC', lon: 1 }));
//   it('wrong lat format : 75A', () => assertThrows('FormatError', postcodes, { lat: '75A', lon: 1 }));
//   it('wrong range too low', () => assertThrows('lat must be between -90 and 90', postcodes, { lat: -91, lon: 1 }));
//   it('wrong range too high', () => assertThrows('lat must be between -90 and 90', postcodes, { lat: 91, lon: 1 }));
//
//   it('Found KB', async () => assert.deepEqual(await town({ lon: 2.3497, lat: 48.8032 }), { insee: '94043', town: 'Le Kremlin-Bicêtre', postcode: '94270' }));
//   it('Found Marseille', async () => assert.deepEqual(await town({ lon: 5.3682, lat: 43.2392 }), { insee: '13208', town: 'Marseille', postcode: '13008' }));
//   it('Not Found', async () => assertThrows(NotFoundError, postcodes, { lon: 180, lat: 90 }));
//   it('Not Found', async () => assertThrows(NotFoundError, postcodes, { lon: 180, lat: 89 }));
//   it('Not Found', async () => assert.deepEqual(await postcodes({ lon: 0, lat: 0 }), { insee: null, town: null, postcode: null }));
  it('Ste-Genevieve-des-Bois', async () => assert.deepEqual(await postcodes({ lon: 2.34108, lat: 48.62507 }), ['91700']));
  it('Geneva', async () => assert.deepEqual(await postcodes({ lat: 46.21002, lon: 6.14349 }), ['1201']));
  it('Marcellaz', async () => assert.deepEqual(await postcodes({ lat: 46.15137, lon: 6.3562 }), ['74250']));
});
