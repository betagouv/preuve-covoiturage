// tslint:disable max-classes-per-file
import supertest from 'supertest';
import chai from 'chai';
import { describe } from 'mocha';
import { CallType } from '@ilos/common';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

const { expect } = chai;
const kernel = new Kernel();
const app = new HttpTransport(kernel);
let request;
let userId;
let cookies;

const user = {
  email: 'admin@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  password: 'Admin12345',
};

function callAdminFactory(params): CallType {
  return {
    params: { ...params },
    method: '',
    result: null,
    context: {
      call: {
        user: {
          role: 'admin',
          group: 'registry',
          permissions: ['user.create', 'user.delete', 'user.patch'],
        },
      },
      channel: {
        service: 'proxy',
        transport: 'http',
      },
    },
  };
}

describe('User service', async () => {
  before(async () => {
    await kernel.bootstrap();
    await app.up();

    const registerAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'register',
    });
    const { _id } = await registerAction.call(callAdminFactory(user));
    userId = _id;
  });

  after(async () => {
    const deleteAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'delete',
    });
    await deleteAction.call(callAdminFactory({ _id: userId }));
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

  it('should return session content on profile', async () => {
    const r = await request
      .get('/profile')
      .set('Cookie', cookies)
      .expect(200);
    expect(r.body.payload.data).to.deep.include({
      firstname: user.firstname,
      lastname: user.lastname,
    });
  });

  it('should list user', async () => {
    const r = await request
      .get('/users')
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.be.an('array');
    expect(data.length).to.eq(1);
    expect(data[0]).to.deep.include({
      firstname: user.firstname,
      lastname: user.lastname,
    });
  });

  it('should get user', async () => {
    const r = await request
      .get(`/users/${userId}`)
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.deep.include({
      firstname: user.firstname,
      lastname: user.lastname,
    });
  });

  it('should patch user', async () => {
    user.firstname = 'Jean';
    const r = await request
      .put(`/users/${userId}`)
      .set('Cookie', cookies)
      .send({ patch: { firstname: 'Jean' } })
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.deep.include({
      firstname: user.firstname,
      lastname: user.lastname,
    });
  });

  it('should patch profile', async () => {
    user.firstname = 'john';
    const r = await request
      .put('/profile')
      .set('Cookie', cookies)
      .send({ patch: { firstname: 'john' } })
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.deep.include({
      firstname: user.firstname,
      lastname: user.lastname,
    });
  });
});
