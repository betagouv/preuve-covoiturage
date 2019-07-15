const supertest = require('supertest');
const app = require('@pdc/proxy/app');
const assertResponse = require('../../../shared/test/lib/assert-response');
const { superAdmin, signin } = require('../../lib/signin');

const request = supertest(app);

describe('Super admin', () => {
  const storage = {};

  it('POST /auth/signin :: OK (fetch JWT)', async () => {
    storage.user = await signin(superAdmin);
  });

  it('GET /auth/check :: OK', async () =>
    request
      .get('/auth/check')
      .set('accept', 'json')
      .set('Authorization', `Bearer ${storage.user.token}`)
      .expect(assertResponse(200, { id: storage.user._id })));

  it('POST /auth/signin :: fake email', async () =>
    request
      .post('/auth/signin')
      .send({
        email: 'fake.email@example.com',
        password: superAdmin.password,
      })
      .set('accept', 'json')
      .expect(403));

  it('POST /auth/signin :: fake password', async () =>
    request
      .post('/auth/signin')
      .send({
        email: 'superAdmin.email',
        password: 'bU11sh!tm3n0t',
      })
      .set('accept', 'json')
      .expect(403));
});
