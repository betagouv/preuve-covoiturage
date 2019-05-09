// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';

import { HttpTransport } from '../src/transports/HttpTransport';
import { Kernel } from '../src/parents/Kernel';
import { httpHandlerFactory } from '../src/serviceHandlers/HttpHandler';
import { TransportInterface } from '../src/interfaces/TransportInterface';
import { injectable } from '../src/container';

import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider';
import { ServiceProvider as StringServiceProvider } from './mock/StringService/ServiceProvider';

@injectable()
class MathKernel extends Kernel {
  name = 'math';
  serviceProviders = [MathServiceProvider];
}

@injectable()
class StringKernel extends Kernel {
  name = 'string';
  serviceProviders = [
    StringServiceProvider,
  ];
  handlers = [
    httpHandlerFactory('math', 'http://127.0.0.1:8080'),
  ];
}

function makeRPCCall(port: number, req: { method: string; params?: any }[]) {
  let data;

  if (req.length === 1) {
    data = {
      jsonrpc: '2.0',
      method: req[0].method,
      params: req[0].params,
      id: 0,
    };
  } else {
    data = [];
    for (const i of Object.keys(req)) {
      data.push({
        jsonrpc: '2.0',
        method: req[i].method,
        params: req[i].params,
        id: Number(i),
      });
    }
  }
  return axios.post(`http://127.0.0.1:${port}`, data, {
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
  });
}
let mathTransport: TransportInterface;
let stringTransport: TransportInterface;

describe('Http only integration', () => {
  before(async () => {
    const mathKernel = new MathKernel();
    await mathKernel.boot();
    mathTransport = new HttpTransport(mathKernel);
    await mathTransport.up(['8080']);

    const stringKernel = new StringKernel();
    await stringKernel.boot();
    stringTransport = new HttpTransport(stringKernel);
    await stringTransport.up(['8081']);
  });

  after(async () => {
    await mathTransport.down();
    await stringTransport.down();
  });

  it('should works', async () => {
    const responseMath = await makeRPCCall(8080, [
      { method: 'math:add', params: [1, 1] },
    ]);
    expect(responseMath.data).to.deep.equal({
      jsonrpc: '2.0',
      id: 0,
      result: 2,
    });

    const responseString = await makeRPCCall(8081, [
      { method: 'string:hello', params: { name: 'sam' } },
    ]);
    expect(responseString.data).to.deep.equal({
      jsonrpc: '2.0',
      id: 0,
      result: 'Hello world sam',
    });
  });

  it('should works with internal service call', async () => {
    const response = await makeRPCCall(8081, [
      { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
    ]);
    expect(response.data).to.deep.equal({
      jsonrpc: '2.0',
      id: 0,
      result: 'Hello world sam, result is 2',
    });
  });

  it('should works with batch call', async () => {
    const response = await makeRPCCall(8081, [
      { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
      { method: 'string:result', params: { name: 'john', add: [1, 10] } },
    ]);
    expect(response.data).to.deep.equal([
      {
        jsonrpc: '2.0',
        id: 0,
        result: 'Hello world sam, result is 2',
      },
      {
        jsonrpc: '2.0',
        id: 1,
        result: 'Hello world john, result is 11',
      },
    ]);
  });
});
