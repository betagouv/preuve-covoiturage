import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

const { expect } = chai;

describe('Operator applications', () => {
  const kernel = new Kernel();
  const app = new HttpTransport(kernel);
  let request;
  let operatorAUser;
  let operatorA;
  let operatorBUser;
  let operatorB;
  let cookies;
  let applicationA;
  let applicationB;

  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-applications-${new Date().getTime()}`;
    await kernel.bootstrap();
    await app.up();

    request = supertest(app.app);

    operatorA = await kernel.call(
      'operator:create',
      {
        nom_commercial: 'Operator A',
        raison_sociale: 'Operator A inc.',
      },
      {
        call: { user: { permissions: ['operator.create'] } },
        channel: {
          service: 'operator',
          transport: 'http',
        },
      },
    );

    operatorB = await kernel.call(
      'operator:create',
      {
        nom_commercial: 'Operator B',
        raison_sociale: 'Operator B inc.',
      },
      {
        call: { user: { permissions: ['operator.create'] } },
        channel: {
          service: 'operator',
          transport: 'http',
        },
      },
    );

    operatorAUser = await kernel.call(
      'user:register',
      {
        email: 'operatorA@example.com',
        password: 'Admin12345',
        firstname: 'John',
        lastname: 'Schmidt',
        phone: '+33624857425',
        group: 'operators',
        role: 'admin',
        operator: operatorA._id.toString(),
      },
      {
        call: { user: { permissions: ['user.register'] } },
        channel: {
          service: 'user',
          transport: 'http',
        },
      },
    );

    operatorBUser = await kernel.call(
      'user:register',
      {
        email: 'operatorB@example.com',
        password: 'Admin12345',
        firstname: 'John',
        lastname: 'Schmidt',
        phone: '+33624857425',
        group: 'operators',
        role: 'admin',
        operator: operatorB._id.toString(),
      },
      {
        call: { user: { permissions: ['user.register'] } },
        channel: {
          service: 'user',
          transport: 'http',
        },
      },
    );
  });

  after(async () => {
    await app.down();
  });

  describe('Operator A CRUD operations', () => {
    beforeEach(async () => {
      // log the operatorUser
      const res = await request.post('/login').send({
        email: operatorAUser.email,
        password: 'Admin12345',
      });
      const re = new RegExp('; path=/; httponly', 'gi');

      // Save the cookie to use it later to retrieve the session
      if (!res.headers['set-cookie']) {
        throw new Error('Failed to set cookie');
      }

      cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');
    });

    it('REST create app A', async () => {
      return request
        .post(`/operators/${operatorA._id.toString()}/applications`)
        .send({ name: 'Application A', permissions: ['journey.create'] })
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('sha256');
          expect(response.body).to.have.property('payload');
          expect(response.body.payload).to.have.property('data');
          expect(response.body.payload.data).to.have.property('name', 'Application A');
          expect(response.body.payload.data).to.have.property('operator_id', operatorA._id);

          applicationA = response.body.payload.data;
        });
    });

    it('REST create app B', async () => {
      return request
        .post(`/operators/${operatorA._id.toString()}/applications`)
        .send({ name: 'Application B', permissions: ['journey.create'] })
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('sha256');
          expect(response.body).to.have.property('payload');
          expect(response.body.payload).to.have.property('data');
          expect(response.body.payload.data).to.have.property('name', 'Application B');
          expect(response.body.payload.data).to.have.property('operator_id', operatorA._id);

          applicationB = response.body.payload.data;
        });
    });

    it('REST all', async () => {
      return request
        .get(`/operators/${operatorA._id.toString()}/applications`)
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('sha256');
          expect(response.body).to.have.property('payload');
          expect(response.body.payload).to.have.property('data');
          expect(response.body.payload.data).to.be.an.instanceOf(Array);
          expect(response.body.payload.data.length).to.be.eq(2);
        });
    });

    it('REST find Application A', async () => {
      return request
        .get(`/operators/${operatorA._id.toString()}/applications/${applicationA._id.toString()}`)
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('sha256');
          expect(response.body).to.have.property('payload');
          expect(response.body.payload).to.have.property('data');
          expect(response.body.payload.data).to.have.property('name', 'Application A');
          expect(response.body.payload.data).to.have.property('_id', applicationA._id.toString());
          expect(response.body.payload.data).to.have.property('operator_id', operatorA._id);
        });
    });

    it('REST find Application B', async () => {
      return request
        .get(`/operators/${operatorA._id.toString()}/applications/${applicationB._id.toString()}`)
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('sha256');
          expect(response.body).to.have.property('payload');
          expect(response.body.payload).to.have.property('data');
          expect(response.body.payload.data).to.have.property('name', 'Application B');
          expect(response.body.payload.data).to.have.property('_id', applicationB._id.toString());
          expect(response.body.payload.data).to.have.property('operator_id', operatorA._id);
        });
    });
  });

  describe('Operator B Rogue operations', () => {
    beforeEach(async () => {
      // log the operatorUser
      const res = await request.post('/login').send({
        email: operatorBUser.email,
        password: 'Admin12345',
      });
      const re = new RegExp('; path=/; httponly', 'gi');

      // Save the cookie to use it later to retrieve the session
      if (!res.headers['set-cookie']) {
        throw new Error('Failed to set cookie');
      }

      cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');
    });

    it("REST fails to access someone else's application by Id", async () => {
      return request
        .get(`/operators/${operatorA._id.toString()}/applications/${applicationA._id.toString()}`)
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(403);
        });
    });

    it("REST fails to access someone else's applications", async () => {
      return request
        .get(`/operators/${operatorA._id.toString()}/applications`)
        .set('Cookie', cookies)
        .set('Accept', 'application/json')
        .set('Content-type', 'application/json')
        .expect((response: supertest.Response) => {
          expect(response.status).to.eq(403);
        });
    });
  });
});
