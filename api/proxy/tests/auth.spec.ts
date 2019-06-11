// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import supertest from 'supertest';
import chai from 'chai';
import { App } from '../src/App';
import { Kernel } from '../src/bridge/Kernel';
import { Interfaces, Parents, Container, Exceptions } from '@pdc/core';

@Container.handler({
  service: 'user',
  method: 'login',
})
class UserLoginAction extends Parents.Action implements Interfaces.HandlerInterface {
  users = [
    {
      login: 'test@test.com',
      password: '12345',
      extras: {
        message: 'hello world',
      },
    },
  ];

  protected async handle(params): Promise<any> {
    const { login, password } = params;

    const user = this.users.find((user) => {
      return user.login === login;
    });

    if (!user || user.password !== password) {
      throw new Exceptions.ForbiddenException();
    }

    return user.extras;
  }
}

class UserServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  handlers = [UserLoginAction];
}

class ThinKernel extends Kernel {
  serviceProviders = [UserServiceProvider];
}

const { expect } = chai;

const app = new App(new ThinKernel());
let request;

describe('Proxy auth', async () => {
  before(async () => {
    await app.up();
  });

  after(async () => {
    await app.down();
  });

  beforeEach(() => {
    request = supertest(app.app);
  });

  it('should return error on profile if user not authenticated', async () => {
    const r = await request.get('/profile');
    expect(r.status).to.eq(500);
    expect(r.body).to.deep.include({
      message: 'Unauthenticated',
    });

    // cookie should not be sent
    let cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /PDC-Session/.test(cookie));
    }
    expect(cookie).to.be.undefined;
  });

  it('should return error on login failure', async () => {
    const r = await request.post('/login').send({
      login: 'test@test.com',
      password: '123456',
    });
    expect(r.status).to.eq(500);
    expect(r.body).to.deep.include({
      message: 'Forbidden',
    });

    let cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /PDC-Session/.test(cookie));
    }
    expect(cookie).to.be.undefined;
  });

  it('should return session cookie on login', async () => {
    const r = await request.post('/login').send({
      login: 'test@test.com',
      password: '12345',
    });
    expect(r.status).to.eq(200);
    expect(r.body).to.deep.include({
      payload: {
        data: {
          message: 'hello world',
        },
        meta: null,
      },
    });
    expect(r.header['set-cookie'].find((cookie: string) => /PDC-Session/.test(cookie))).to.not.be.undefined;
  });

  it('should read session on profile', async () => {
    const res = await request.post('/login').send({
      login: 'test@test.com',
      password: '12345',
    });
    const re = new RegExp('; path=/; httponly', 'gi');

    // Save the cookie to use it later to retrieve the session
    const cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');

    const r = await request.get('/profile').set('Cookie', cookies);

    expect(r.status).to.eq(200);
    expect(r.body).to.deep.include({
      payload: {
        data: {
          message: 'hello world',
        },
        meta: null,
      },
    });
  });

  it('should delete session on logout', async () => {
    const res = await request.post('/login').send({
      login: 'test@test.com',
      password: '12345',
    });

    const re = new RegExp('; path=/; httponly', 'gi');

    // Save the cookie to use it later to retrieve the session
    const cookies = res.headers['set-cookie'].map((r) => r.replace(re, '')).join('; ');

    const r = await request.post('/logout').set('Cookie', cookies);

    expect(r.status).to.eq(204);

    // cookie should not be sent
    let cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /PDC-Session/.test(cookie));
    }
    expect(cookie).to.be.undefined;

    const rr = await request.get('/profile').set('Cookie', cookies);

    expect(rr.status).to.eq(500);
    expect(rr.body).to.deep.include({
      message: 'Unauthenticated',
    });
  });
});
