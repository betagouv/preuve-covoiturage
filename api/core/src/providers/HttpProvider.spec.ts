import { describe } from 'mocha';
import chai, { expect, assert } from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';

import { HttpProvider } from './HttpProvider';


chai.use(chaiNock);
chai.use(chaiAsPromised);

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

    const provider = new HttpProvider('service', url);
    provider.boot();
    provider.call('method', { param: true }, { internal: true });

    return (<any>expect(nockRequest).to.have.been).requestedWith({
      id: null,
      jsonrpc: '2.0',
      method: 'service@latest:method',
      params: {
        param: true,
      },
      context: {
        internal: true,
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

    const provider = new HttpProvider('service', url);
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

    const provider = new HttpProvider('service', url);
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

    const provider = new HttpProvider('service', url);
    provider.boot();
    const promise = provider.call('method', { param: true }, { internal: true });
    return (<any>assert).isRejected(promise, Error, 'wrong!');
  });
});
