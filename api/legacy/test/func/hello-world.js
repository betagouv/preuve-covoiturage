const _ = require('lodash');
const supertest = require('supertest');
const app = require('@pdc/proxy/app');
const assertResponse = require('../../shared/test/lib/assert-response');

const request = supertest(app);

describe('Hello World', () => {
  it('GET / :: equal', async () =>
    request
      .get('/')
      .set('accept', 'json')
      .expect(assertResponse(200, { status: 'Hello World' })));

  it('GET / :: regex', async () =>
    request
      .get('/')
      .set('accept', 'json')
      .expect(assertResponse(200, { status: new RegExp('Hello World', 'i') })));

  it('GET / :: function as first class object', async () =>
    request
      .get('/')
      .set('accept', 'json')
      .expect(assertResponse(200, { status: _.isString })));

  it('GET / :: custom function', async () =>
    request
      .get('/')
      .set('accept', 'json')
      .expect(assertResponse(200, { status: (val) => val === 'Hello World' })));
});
