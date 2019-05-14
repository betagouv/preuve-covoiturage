/* eslint-disable no-param-reassign */
const supertest = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('@pdc/proxy/app');
const { assertResponse } = require('@pdc/shared-helpers').test;
const { jwtSecret } = require('@pdc/shared-config');

const request = supertest(app);

const superAdmin = {
  email: 'admin@example.com',
  password: 'admin1234',
  token: null,
  id: null,
};

export default {
  superAdmin,
  async signin(user) {
    await request
      .post('/auth/signin')
      .send({
        email: user.email,
        password: user.password,
      })
      .set('accept', 'json')
      .expect(assertResponse(200, {
        user: {
          _id(id) {
            if (!id) throw new Error('Missing user._id');
            user.id = id;

            return true;
          },
        },
        token(jwtToken) {
          // return the payload synchronously or throw
          jwt.verify(jwtToken, jwtSecret);

          // set the token for reuse
          user.token = jwtToken;

          return true;
        },
      }));

    return user;
  },
};
