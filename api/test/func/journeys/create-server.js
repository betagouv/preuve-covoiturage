/* eslint-disable global-require */
const supertest = require('supertest');
const app = require('../../../src/app');
const assertResponse = require('../../lib/assert-response');
const { signin } = require('../../lib/signin');

const request = supertest(app);

describe('Journeys', () => {
  const storage = {
    operatorId: null,
    appId: null,
    appToken: null,
    user: null,
  };

  before(async () => {
    storage.user = await signin({
      email: 'operator@example.com',
      password: 'operator',
    });
  });

  it('POST /operators/applications :: Create', async () => request
    .post('/operators/applications')
    .send({
      name: 'Dummy Application',
    })
    .set('Authorization', `Bearer ${storage.user.token}`)
    .set('accept', 'json')
    .expect(assertResponse(201, {
      app(appId) {
        storage.appId = appId;
        return true;
      },
      token(appToken) {
        storage.appToken = appToken;
        return true;
      },
    })));

  it('POST /journeys/push :: server create random', async () => request
    .post('/journeys/push')
    .send(require('../../data/journeys/random'))
    .set('Authorization', `Bearer ${storage.appToken}`)
    .set('accept', 'json')
    .expect(201));
});
