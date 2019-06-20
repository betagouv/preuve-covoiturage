import { expect } from 'chai';
import supertest from 'supertest';
import { Parents } from '@ilos/core';
import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';

import { routeMapping, ObjectRouteMapType, ArrayRouteMapType } from './routeMapping';

const app = express();

let request;
const fakeUser = {
  id: '1',
  firstName: 'Nicolas',
  lastName: 'Test',
};

function responseFactory(method, params) {
  return {
    method,
    params,
    _context: {
      call: {
        user: fakeUser,
      },
      channel: {
        service: 'proxy',
        transport: 'http',
      },
    },
  };
}

app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  expressSession({
    secret: 'SECRET',
  }),
);

app.use((req, res, next) => {
  req.session.user = fakeUser;
  next();
});

class Kernel extends Parents.Kernel {
  async handle(call) {
    return {
      jsonrpc: '2.0',
      id: call.id,
      result: {
        method: call.method,
        ...call.params,
      },
    };
  }
}

const kernel = new Kernel();
const routeMap: (ObjectRouteMapType | ArrayRouteMapType)[] = [
  {
    verb: 'post',
    route: '/user/:id',
    signature: 'user:update',
    mapRequest(body, query, params) {
      return {
        ...body,
        id: params.id,
      };
    },
  },
  {
    verb: 'get',
    route: '/user/:id',
    signature: 'user:read',
    mapResponse(response) {
      return {
        ...response,
        params: fakeUser,
      };
    },
  },
  ['post', '/user', 'user:create'],
  // {
  //   verb:'post',
  //   route:'/user',
  //   signature:'user:create'
  // },
  {
    verb: 'get',
    route: '/user',
    signature: 'user:list',
    mapRequest(body, query, params) {
      return {
        ...body,
        ...query,
      };
    },
  },
];

routeMapping(routeMap, app, kernel);

describe('Route mapping', () => {
  before(async () => {
    request = supertest(app);
  });

  it('works', async () => {
    const response = await request
      .post('/user')
      .send({
        firstName: 'John',
        lastName: 'Doe',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).equal(200);
    expect(response.body).to.deep.equal(
      responseFactory('user:create', {
        firstName: 'John',
        lastName: 'Doe',
      }),
    );
  });

  it('works with url params', async () => {
    const response = await request
      .post('/user/1')
      .send({
        firstName: 'John',
        lastName: 'Doe',
      })
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).equal(200);
    expect(response.body).to.deep.equal(
      responseFactory('user:update', {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
      }),
    );
  });

  it('works with query params', async () => {
    const response = await request
      .get('/user/?orderBy=date')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).equal(200);
    expect(response.body).to.deep.equal(
      responseFactory('user:list', {
        orderBy: 'date',
      }),
    );
  });

  it('works with response mapping', async () => {
    const response = await request
      .get('/user/1')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');

    expect(response.status).equal(200);
    expect(response.body).to.deep.equal(
      responseFactory('user:read', {
        ...fakeUser,
      }),
    );
  });
});
