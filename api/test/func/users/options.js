const supertest = require('supertest');
const app = require('@pdc/proxy/app');
const assertResponse = require('../../../shared/test/lib/assert-response');

const request = supertest(app);

const superAdmin = {
  email: 'admin@example.com',
  password: 'admin1234',
  token: null,
  id: null,
};

// set the token for reuse
before(async () => request
  .post('/auth/signin')
  .send({
    email: superAdmin.email,
    password: superAdmin.password,
  })
  .set('accept', 'json')
  .expect(assertResponse(200, {
    user: {
      _id(id) {
        if (!id) throw new Error('Missing user._id');
        superAdmin.id = id;

        return true;
      },
    },
    token(jwtToken) {
      superAdmin.token = jwtToken;

      return true;
    },
  })));

describe('User options', () => {
  it('GET /users/:id/options :: list options', async () => request
    .get(`/users/${superAdmin.id}/options`)
    .set('accept', 'json')
    .set('Authorization', `Bearer ${superAdmin.token}`)
    .expect(assertResponse(200, {})));

  it('POST /users/:id/options :: create option', async () => request
    .post(`/users/${superAdmin.id}/options`)
    .send({
      key: 'option-name',
      value: 'option-value',
    })
    .set('accept', 'json')
    .set('Authorization', `Bearer ${superAdmin.token}`)
    .expect(assertResponse(200, {
      'option-name': 'option-value',
    })));

  it('GET /users/:id/options/option-name :: read option', async () => request
    .get(`/users/${superAdmin.id}/options/option-name`)
    .set('accept', 'json')
    .set('Authorization', `Bearer ${superAdmin.token}`)
    .expect(assertResponse(200, 'option-value')));

  it('DELETE /users/:id/options/option-name :: delete option', async () => request
    .delete(`/users/${superAdmin.id}/options/option-name`)
    .set('accept', 'json')
    .set('Authorization', `Bearer ${superAdmin.token}`)
    .expect(assertResponse(200, {})));
});
