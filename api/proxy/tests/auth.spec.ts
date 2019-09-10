// tslint:disable max-classes-per-file

import path from 'path';
import supertest from 'supertest';
import chai from 'chai';
import { describe } from 'mocha';
import { HandlerInterface, handler, kernel, serviceProvider, ForbiddenException } from '@ilos/common';
import { Action, ServiceProvider } from '@ilos/core';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';

@handler({
  service: 'user',
  method: 'login',
})
class UserLoginAction extends Action implements HandlerInterface {
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

    const user = this.users.find((u) => u.login === login);

    if (!user || user.password !== password) {
      throw new ForbiddenException();
    }

    return user.extras;
  }
}

@serviceProvider({
  handlers: [UserLoginAction],
})
class UserServiceProvider extends ServiceProvider {}

@kernel({
  children: [UserServiceProvider],
})
class ThinKernel extends Kernel {}

const { expect } = chai;
const customKernel = new ThinKernel();
const app = new HttpTransport(customKernel);
let request;

describe('Proxy auth', async () => {
  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    await customKernel.bootstrap();
    await app.up(['0']);
  });

  after(async () => {
    await app.down();
  });

  beforeEach(() => {
    request = supertest(app.app);
  });

  it('should return error on profile if user not authenticated', async () => {
    const r = await request.get('/profile').expect((body) => console.log(body));
    expect(r.status).to.eq(500);
    expect(r.body).to.deep.include({
      message: 'Unauthenticated',
    });

    // cookie should not be sent
    const cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /pdc-session/.test(cookie));
    }
    expect(cookie).to.eq(undefined);
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

    const cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /pdc-session/.test(cookie));
    }
    expect(cookie).to.eq(undefined);
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
    expect(r.header['set-cookie'].find((cookie: string) => /pdc-session/.test(cookie))).to.not.be.undefined;
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
    const cookie = undefined;
    if ('set-cookie' in r.header) {
      r.header['set-cookie'].find((cookie: string) => /pdc-session/.test(cookie));
    }
    expect(cookie).to.eq(undefined);

    const rr = await request.get('/profile').set('Cookie', cookies);

    expect(rr.status).to.eq(500);
    expect(rr.body).to.deep.include({
      message: 'Unauthenticated',
    });
  });
});
