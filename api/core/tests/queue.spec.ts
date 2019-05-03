// import { describe } from 'mocha';
// import { expect } from 'chai';
// import axios from 'axios';

// import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider';
// import { ServiceProvider as StringServiceProvider } from './mock/StringService/ServiceProvider';
// import { QueueTransport } from '../src/transports/QueueTransport';
// import { HttpTransport } from '../src/transports/HttpTransport';
// import { Kernel } from '../src/Kernel';
// import { ServiceProviderConstructorInterface } from '../src/interfaces/ServiceProviderConstructorInterface';
// import { httpServiceProviderFactory } from '../src/helpers/httpServiceProviderFactory';
// import { KernelInterface } from '../src/interfaces/KernelInterface';

// class MathKernel extends Kernel {
//   services: ServiceProviderConstructorInterface[] = [
//     MathServiceProvider,
//   ];
// }

// class StringKernel extends Kernel {
//   services: ServiceProviderConstructorInterface[] = [
//     StringServiceProvider,
//     httpServiceProviderFactory('math', 'http://127.0.0.1:8080'),
//   ];
// }

// function makeRPCCall(port: number, req: { method: string, params?: any }[]) {
//   let data;

//   if (req.length === 1) {
//     data = {
//       jsonrpc: '2.0',
//       method: req[0].method,
//       params: req[0].params,
//       id: 0,
//     }
//   } else {
//     data = [];
//     for (const i in req) {
//       data.push({
//         jsonrpc: '2.0',
//         method: req[i].method,
//         params: req[i].params,
//         id: Number(i),
//       });
//     }
//   }
//   return axios.post(`http://127.0.0.1:${port}`, data, {
//     headers: {
//       'Accept': 'application/json',
//       'Content-type': 'application/json',
//     },
//   });
// }

// let httpMathKernel: KernelInterface;
// let httpStringKernel: KernelInterface;
// let queueMathKernel: KernelInterface;
// let queueStringKernel: KernelInterface;

// describe(('Queue integration'), (() => {
//     // before(async () => {
//     //     httpMathKernel = new MathKernel();
//     //     await httpMathKernel.boot();
//     //     await httpMathKernel.up(HttpTransport, [ '8080' ]);

//     //     httpStringKernel = new StringKernel();
//     //     await httpStringKernel.boot();
//     //     await httpStringKernel.up(HttpTransport, [ '8081' ]);

//     //     queueMathKernel = new MathKernel();
//     //     await queueMathKernel.boot();
//     //     await queueMathKernel.up(QueueTransport, [ 'redis://127.0.0.1:6379/0', 'test' ]);

//     //     queueStringKernel = new StringKernel();
//     //     await queueStringKernel.boot();
//     //     await queueStringKernel.up(QueueTransport, [ 'redis://127.0.0.1:6379/0', 'test' ]);
//     // });

//     // after(async () => {
//     //     await httpMathKernel.down();
//     //     await httpStringKernel.down();
//     //     await queueMathKernel.down();
//     //     await queueStringKernel.down();
//     // });

//     // it('should works', async () => {
//     //   const responseMath = await makeRPCCall(8080, [{ method: 'math:add', params: [1, 1]}]);
//     //   expect(responseMath.data).to.deep.equal({
//     //     jsonrpc: '2.0',
//     //     id: 0,
//     //     result: 2,
//     //   });

//     //   const responseString = await makeRPCCall(8081, [{ method: 'string:hello', params: { name: 'sam' }}]);
//     //   expect(responseString.data).to.deep.equal({
//     //     jsonrpc: '2.0',
//     //     id: 0,
//     //     result: 'Hello world sam',
//     //   });
//     // });

//     // it('should works with internal service call', async () => {
//     //   const response = await makeRPCCall(8081, [{ method: 'string:result', params: { name: 'sam', add: [1, 1]}}]);
//     //   expect(response.data).to.deep.equal({
//     //     jsonrpc: '2.0',
//     //     id: 0,
//     //     result: 'Hello world sam, result is 2',
//     //   });
//     // });

//     // it('should works with batch call', async () => {
//     //   const response = await makeRPCCall(8081, [
//     //     { method: 'string:result', params: { name: 'sam', add: [1, 1]}},
//     //     { method: 'string:result', params: { name: 'john', add: [1, 10]}},
//     //   ]);
//     //   expect(response.data).to.deep.equal([
//     //     {
//     //       jsonrpc: '2.0',
//     //       id: 0,
//     //       result: 'Hello world sam, result is 2',
//     //     },
//     //     {
//     //       jsonrpc: '2.0',
//     //       id: 1,
//     //       result: 'Hello world john, result is 11',
//     //     },
//     //   ]);
//     // });
// }));
