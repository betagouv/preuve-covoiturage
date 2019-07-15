import supertest from 'supertest';
import chai from 'chai';
import { describe } from 'mocha';
import { CallType } from '@ilos/common';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

const { expect } = chai;

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
          permissions: ['user.create', 'user.delete', 'operator.create', 'operator.delete'],
        },
      },
      channel: {
        service: 'proxy',
        transport: 'http',
      },
    },
  };
}

describe('Operator service', async () => {
  const kernel = new Kernel();
  const app = new HttpTransport(kernel);
  let request;
  let cookies;

  let operatorId;
  const user = {
    email: 'admin@example.com',
    firstname: 'john',
    lastname: 'schmidt',
    phone: '0624857425',
    group: 'registry',
    role: 'admin',
    password: 'Admin12345',
  };

  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-operator-${new Date().getTime()}`;
    await kernel.bootstrap();
    await app.up();

    request = supertest(app.app);

    const registerAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'register',
    });
    await registerAction.call(callAdminFactory(user));
  });

  beforeEach(async () => {
    const res = await request.post('/login').send({
      email: user.email,
      password: user.password,
    });
    const re = new RegExp('; path=/; httponly', 'gi');

    // Save the cookie to use it later to retrieve the session
    cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');
  });

  after(async () => {
    await app.down();
  });

  it('should create operator', async () => {
    const customOperator = {
      nom_commercial: 'Mega covoit',
      raison_sociale: 'Mega covoit inc.',
    };

    return request
      .post('/operators')
      .send(customOperator)
      .set('Cookie', cookies)
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
        expect(response.body.payload.data).to.have.property('_id');
        expect(response.body.payload.data).to.have.property('nom_commercial', 'Mega covoit');
        expect(response.body.payload.data).to.have.property('raison_sociale', 'Mega covoit inc.');

        // store operatorId for re-use
        operatorId = response.body.payload.data._id;
      });
  });

  it('should list operator', async () =>
    request
      .get('/operators')
      .set('Cookie', cookies)
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
        expect(response.body.payload.data).to.be.an('array');
        expect(response.body.payload.data.length).to.be.greaterThan(0);
      }));

  it('should patch operator', async () =>
    request
      .put(`/operators/${operatorId}`)
      .send({
        patch: {
          nom_commercial: 'Maxi',
        },
      })
      .set('Cookie', cookies)
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
        expect(response.body.payload.data).to.have.property('nom_commercial', 'Maxi');
      }));

  it('should delete operator', async () =>
    request
      .delete(`/operators/${operatorId}`)
      .set('Cookie', cookies)
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
      }));
});
