import anyTest, { TestInterface } from 'ava';
import supertest from 'supertest';
import { Kernel as AbstractKernel } from '@ilos/core';
import express from 'express';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import { RPCResponseType, KernelInterface } from '@ilos/common';

import { routeMapping, ObjectRouteMapType, ArrayRouteMapType } from './routeMapping';

class Kernel extends AbstractKernel {
  async handle(call): Promise<RPCResponseType> {
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

const test = anyTest as TestInterface<{
  kernel: KernelInterface;
  routeMap: (ObjectRouteMapType | ArrayRouteMapType)[];
  app: any;
  request: any;
  fakeUser: { id: string; firstName: string; lastname: string };
  responseFactory: Function;
}>;

test.before(async (t) => {
  t.context.app = express();

  t.context.fakeUser = {
    id: '1',
    firstName: 'Nicolas',
    lastname: 'Test',
  };

  t.context.responseFactory = (method: string, params: any): any => {
    return {
      method,
      params,
      _context: {
        call: {
          user: t.context.fakeUser,
        },
        channel: {
          service: 'proxy',
          transport: 'http',
        },
      },
    };
  };

  t.context.app.use(bodyParser.json({ limit: '2mb' }));
  t.context.app.use(bodyParser.urlencoded({ extended: false }));
  t.context.app.use(
    expressSession({
      secret: 'SECRET',
      resave: false,
      saveUninitialized: false,
    }),
  );

  t.context.app.use((req, res, next) => {
    req.session.user = t.context.fakeUser;
    next();
  });

  t.context.kernel = new Kernel();
  t.context.routeMap = [
    {
      verb: 'post',
      route: '/user/:id',
      signature: 'user:update',
      mapRequest(body, query, params): any {
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
      mapResponse(response): any {
        return {
          ...response,
          params: t.context.fakeUser,
        };
      },
    },
    ['post', '/user', 'user:create'],
    {
      verb: 'get',
      route: '/user',
      signature: 'user:list',
      mapRequest(body, query): any {
        return {
          ...body,
          ...query,
        };
      },
    },
  ];

  routeMapping(t.context.routeMap, t.context.app, t.context.kernel);
  t.context.request = supertest(t.context.app);
});

test('[Route mapping] works', async (t) => {
  const response = await t.context.request
    .post('/user')
    .send({
      firstName: 'John',
      lastname: 'Doe',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 200);
  t.deepEqual(
    response.body,
    t.context.responseFactory('user:create', {
      firstName: 'John',
      lastname: 'Doe',
    }),
  );
});

test('[Route mapping] works with url params', async (t) => {
  const response = await t.context.request
    .post('/user/1')
    .send({
      firstName: 'John',
      lastname: 'Doe',
    })
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 200);
  t.deepEqual(
    response.body,
    t.context.responseFactory('user:update', {
      id: '1',
      firstName: 'John',
      lastname: 'Doe',
    }),
  );
});

test('[Route mapping] works with query params', async (t) => {
  const response = await t.context.request
    .get('/user/?orderBy=date')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 200);
  t.deepEqual(
    response.body,
    t.context.responseFactory('user:list', {
      orderBy: 'date',
    }),
  );
});

test('[Route mapping] works with response mapping', async (t) => {
  const response = await t.context.request
    .get('/user/1')
    .set('Accept', 'application/json')
    .set('Content-Type', 'application/json');

  t.is(response.status, 200);
  t.deepEqual(
    response.body,
    t.context.responseFactory('user:read', {
      ...t.context.fakeUser,
    }),
  );
});
