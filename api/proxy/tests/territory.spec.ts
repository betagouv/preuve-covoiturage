// tslint:disable max-classes-per-file
import supertest from 'supertest';
import chai from 'chai';
import { describe } from 'mocha';
import { Types } from '@ilos/core';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

const { expect } = chai;
const kernel = new Kernel();
const app = new HttpTransport(kernel);
let request;
let cookies;

let userId;
const user = {
  email: 'admin@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  password: 'Admin12345',
};

let territoryId;
const territory = {
  name: 'La commune libre de Paris',
  shortname: 'Paris',
};

function callAdminFactory(params): Types.CallType {
  return {
    params: { ...params },
    method: '',
    result: null,
    context: {
      call: {
        user: {
          role: 'admin',
          group: 'registry',
          permissions: ['user.create', 'user.delete', 'territory.create', 'territory.delete'],
        },
      },
      channel: {
        service: 'proxy',
        transport: 'http',
      },
    },
  };
}

describe('Territory service', async () => {
  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-territory-${new Date().getTime()}`;
    await kernel.bootstrap();
    await app.up();

    const registerAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'register',
    });
    const { _id: userDbId } = await registerAction.call(callAdminFactory(user));
    userId = userDbId;

    const createTerritoryAction = kernel.getContainer().getHandler({
      service: 'territory',
      method: 'create',
    });
    const { _id: territoryDbId } = await createTerritoryAction.call(callAdminFactory(territory));
    territoryId = territoryDbId;
  });

  after(async () => {
    const deleteAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'delete',
    });
    await deleteAction.call(callAdminFactory({ _id: userId }));

    const deleteTerritoryAction = kernel.getContainer().getHandler({
      service: 'territory',
      method: 'delete',
    });
    await deleteTerritoryAction.call(callAdminFactory({ _id: territoryId }));
    await app.down();
  });

  beforeEach(async () => {
    request = supertest(app.app);

    const res = await request.post('/login').send({
      email: user.email,
      password: user.password,
    });
    const re = new RegExp('; path=/; httponly', 'gi');

    // Save the cookie to use it later to retrieve the session
    cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');
  });

  it('should create and delete territory', async () => {
    const customterritory = {
      name: 'La république du Larzac',
      shortname: 'Larzac',
    };

    const r = await request
      .post('/territories')
      .send(customterritory)
      .set('Cookie', cookies)
      .expect(200);

    expect(r.body.payload.data).to.deep.include(customterritory);
    const { _id } = r.body.payload.data;

    await request
      .delete(`/territories/${_id}`)
      .set('Cookie', cookies)
      .expect(200);
  });

  it('should list territory', async () => {
    const r = await request
      .get('/territories')
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.be.an('array');
    expect(data.length).to.eq(1);
    expect(data[0]).to.deep.include(territory);
  });

  it('should patch territory', async () => {
    territory.name = 'Paris';
    const r = await request
      .put(`/territories/${territoryId}`)
      .send({
        patch: {
          name: 'Paris',
        },
      })
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.deep.include(territory);
  });
});
