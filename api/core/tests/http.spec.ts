import { describe } from 'mocha';
import { expect } from 'chai';
import axios from 'axios';

import { HttpTransport } from '~/transports/HttpTransport';
import { Kernel } from '~/Kernel';
import { ServiceProviderConstructorInterface } from '~/interfaces/ServiceProviderConstructorInterface';
import { httpServiceProviderFactory } from '~/helpers/httpServiceProviderFactory';
import { KernelInterface } from '~/interfaces/KernelInterface';

import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider';
import { ServiceProvider as StringServiceProvider } from './mock/StringService/ServiceProvider';

class MathKernel extends Kernel {
  services: ServiceProviderConstructorInterface[] = [MathServiceProvider];
}

class StringKernel extends Kernel {
  services: ServiceProviderConstructorInterface[] = [
    StringServiceProvider,
    httpServiceProviderFactory('math', 'http://127.0.0.1:8080'),
  ];
}

let mathKernel: KernelInterface;
let stringKernel: KernelInterface;

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
describe('Http only integration', () => {
  before(async () => {
    mathKernel = new MathKernel();
    await mathKernel.boot();
    await mathKernel.up(HttpTransport, ['8080']);

    stringKernel = new StringKernel();
    await stringKernel.boot();
    await stringKernel.up(HttpTransport, ['8081']);
  });

  after(async () => {
    await mathKernel.down();
    await stringKernel.down();
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
