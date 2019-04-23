import { describe } from 'mocha';
import chai, { expect, assert } from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';

import { httpProviderFactory } from '../helpers/httpProviderFactory';

chai.use(chaiNock);
chai.use(chaiAsPromised);

const kernel = {
  providers: [],
  services: [],
  boot() { return; },
  async handle(call) {
    return {
      id: null,
      jsonrpc: '2.0',
    };
  },
  get() { throw new Error(); },
};

describe('Http provider', () => {
  it('works', () => {
    const url = 'http://myfakeservice:8080';
    const nockRequest = nock(url)
    .post('/')
    .reply(
      200,
      {
        jsonrpc: '2.0',
        id: null,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpProviderFactory('service', url))(kernel);
    provider.boot();
    provider.call('method', { param: true }, { internal: true });

    return (<any>expect(nockRequest).to.have.been).requestedWith({
      id: null,
      jsonrpc: '2.0',
      method: 'service@latest:method',
      params: {
        _context: {
          internal: true,
        },
        params: {
          param: true,
        },
      },
    });
  });

  it('works with correct headers', () => {
    const url = 'http://myfakeservice:8080';
    const nockRequest = nock(url)
    .post('/')
    .reply(
      200,
      {
        jsonrpc: '2.0',
        id: null,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpProviderFactory('service', url))(kernel);
    provider.boot();
    provider.call('method', { param: true }, { internal: true });

    return (<any>expect(nockRequest).to.have.been).requestedWithHeadersMatch({
      accept: 'application/json',
      'content-type': 'application/json',
    });
  });

  it('throw error on status code error', () => {
    const url = 'http://myfakeservice:8080';
    const nockRequest = nock(url)
    .post('/')
    .reply(
      500,
      {
        jsonrpc: '2.0',
        id: null,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpProviderFactory('service', url))(kernel);
    provider.boot();
    const promise = provider.call('method', { param: true }, { internal: true });
    return (<any>assert).isRejected(promise, Error, 'An error occured');
  });

  it('throw error on status code error', () => {
    const url = 'http://myfakeservice:8080';
    const nockRequest = nock(url)
    .post('/')
    .reply(
      200,
      {
        jsonrpc: '2.0',
        id: null,
        error: {
          message: 'wrong!',
        },
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpProviderFactory('service', url))(kernel);
    provider.boot();
    const promise = provider.call('method', { param: true }, { internal: true });
    return (<any>assert).isRejected(promise, Error, 'wrong!');
  });
});
