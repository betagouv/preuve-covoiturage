import { describe } from 'mocha';
import chai, { expect, assert } from 'chai';
import nock from 'nock';
import chaiNock from 'chai-nock';
import chaiAsPromised from 'chai-as-promised';

import { httpHandlerFactory } from './HttpHandler';

chai.use(chaiNock);
chai.use(chaiAsPromised);

describe('Http handler', () => {
  it('works', () => {
    const url = 'http://myfakeservice:8080';
    const nockRequest = nock(url)
    .post('/')
    .reply(
      200,
      {
        jsonrpc: '2.0',
        id: 1,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpHandlerFactory('service', url))();
    provider.call({
      method: 'service@latest:method',
      params: { param: true },
      context: { internal: true },
    });

    return (<any>expect(nockRequest).to.have.been).requestedWith({
      id: 1,
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
        id: 1,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpHandlerFactory('service', url))();
    provider.call({
      method: 'service@latest:method',
      params: { param: true },
      context: { internal: true },
    });

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
        id: 1,
        result: 'hello world',
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpHandlerFactory('service', url))();
    const promise = provider.call({
      method: 'service@latest:method',
      params: { param: true },
      context: { internal: true },
    });
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
        id: 1,
        error: {
          message: 'wrong!',
        },
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    );

    const provider = new (httpHandlerFactory('service', url))();
    const promise = provider.call({
      method: 'service@latest:method',
      params: { param: true },
      context: { internal: true },
    });
    return (<any>assert).isRejected(promise, Error, 'wrong!');
  });
});
