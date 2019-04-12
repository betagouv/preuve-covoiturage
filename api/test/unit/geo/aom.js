const assert = require('assert');
const mongoose = require('mongoose');
const assertThrows = require('@pdc/shared/test/lib/assert-throws');
const BadRequestError = require('@pdc/shared/errors/bad-request');

const { aom } = require('@pdc/package-geo/geo');

describe('find AOM common', () => {
  it('missing args', () => assertThrows(TypeError, aom));
  it('empty object', () => assertThrows(BadRequestError, aom, {}));
  it('wrong props', () => assertThrows(BadRequestError, aom, { hello: 'world' }));
});

describe('find AOM by INSEE', () => {
  it('wrong INSEE format', () => assertThrows('FormatError', aom, { insee: '75' }));
  it('null INSEE', () => assertThrows(BadRequestError, aom, { insee: null }));
  it('undefined INSEE', () => assertThrows(BadRequestError, aom, { insee: undefined }));
  it('non-existing code', async () => assert.equal(await aom({ insee: '00000' }), null));
  it('mongoose.Document', async () => assert(await aom({ insee: '75056' }) instanceof mongoose.Document));
  it('Same INSEE code', async () => assert.equal((await aom({ insee: '75056' })).insee_main, '75056'));
});

describe('find AOM by lon/lat', () => {
  it('wrong lat format : ABC', () => assertThrows('FormatError', aom, { lat: 'ABC', lon: 1 }));
  it('wrong lat format : 75A', () => assertThrows('FormatError', aom, { lat: '75A', lon: 1 }));
  it('wrong range too low', () => assertThrows('lat must be between -90 and 90', aom, { lat: -91, lon: 1 }));
  it('wrong range too high', () => assertThrows('lat must be between -90 and 90', aom, { lat: 91, lon: 1 }));

  it('Found Paris', async () => assert(await aom({ lon: 2.3497, lat: 48.8032 }) instanceof mongoose.Document));
  it('Found Marseille', async () => assert(await aom({ lon: 5.3682, lat: 43.2392 }) instanceof mongoose.Document));
  it('Not Found', async () => assert.equal(await aom({ lon: 180, lat: 90 }), null));
});
