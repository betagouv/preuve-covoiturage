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

let operatorId;
const operator = {
  nom_commercial: 'Maxi covoit',
  raison_sociale: 'Maxi covoit inc.',
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
          permissions: [
            'user.create',
            'user.delete',
            'operator.create',
            'operator.delete',
          ],
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
  before(async () => {
    await kernel.bootstrap();
    await app.up();

    const registerAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'register',
    });
    const { _id: userDbId } = await registerAction.call(callAdminFactory(user));
    userId = userDbId;

    const createOperatorAction = kernel.getContainer().getHandler({
      service: 'operator',
      method: 'create',
    });
    const { _id: operatorDbId } = await createOperatorAction.call(callAdminFactory(operator));
    operatorId = operatorDbId;
  });

  after(async () => {
    const deleteAction = kernel.getContainer().getHandler({
      service: 'user',
      method: 'delete',
    });
    await deleteAction.call(callAdminFactory({ _id: userId }));

    const deleteOperatorAction = kernel.getContainer().getHandler({
      service: 'operator',
      method: 'delete',
    });
    await deleteOperatorAction.call(callAdminFactory({ _id: operatorId }));
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

  it('should create and delete operator', async () => {
    const customOperator = {
      nom_commercial: 'Mega covoit',
      raison_sociale: 'Mega covoit inc.',
    };

    const r = await request
      .post('/operators')
      .send(customOperator)
      .set('Cookie', cookies)
      .expect(200);

    expect(r.body.payload.data).to.deep.include(customOperator);
    const { _id } = r.body.payload.data;

    await request
      .delete(`/operators/${_id}`)
      .set('Cookie', cookies)
      .expect(200);
  });

  it('should list operator', async () => {
    const r = await request
      .get('/operators')
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.be.an('array');
    expect(data.length).to.eq(1);
    expect(data[0]).to.deep.include(operator);
  });

  it('should patch operator', async () => {
    operator.nom_commercial = 'Maxi';
    const r = await request
      .put(`/operators/${operatorId}`)
      .send({
        patch: {
          nom_commercial: 'Maxi',
        }
      })
      .set('Cookie', cookies)
      .expect(200);
    const data = r.body.payload.data;
    expect(data).to.deep.include(operator);
  });
});
