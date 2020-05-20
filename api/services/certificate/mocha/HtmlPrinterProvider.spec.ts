// import nock from 'nock';
// import axios from 'axios';
// import { get } from 'lodash';
// import { expect } from 'chai';
// import { describe } from 'mocha';
// import * as jwt from 'jsonwebtoken';
// import { ConfigInterfaceResolver } from '@ilos/common';
// import { TokenProviderInterfaceResolver } from '@pdc/provider-token';

// import { HtmlPrinterProvider } from '../providers/HtmlPrinterProvider';

// // override the axios XHR adapter to let it be intercepted by nock
// // @source https://github.com/nock/nock#axios
// axios.defaults.adapter = require('axios/lib/adapters/http');

// /**
//  * Mock the config provider
//  */
// class MockConfigProvider extends ConfigInterfaceResolver {
//   private config = {
//     url: {
//       printerUrl: process.env.APP_PRINTER_URL,
//       apiUrl: process.env.APP_API_URL,
//     },
//     token: {
//       render: {
//         bearer: 'ey12345abcdef.12345abcdef.authOnPrinter',
//         issuer: process.env.APP_API_URL,
//         audience: process.env.APP_PRINTER_URL,
//       },
//     },
//   };

//   public get(key: string): any {
//     return get(this.config, key);
//   }
// }

// /**
//  * Mock the tokenProvider
//  */
// class MockTokenProvider extends TokenProviderInterfaceResolver {
//   async sign<T extends string | Buffer | object>(payload: T, options?: jwt.SignOptions): Promise<string> {
//     return 'ey12345abcdef.12345abcdef.authOnRenderRoute';
//   }
// }

// /**
//  * Run the tests on pdf() and png() methods
//  */
// describe('HtmlPrinterProvider', () => {
//   const uuid = 'f68b18a7-0fa0-42e1-a5f3-acdcfab7b6bc';
//   const token = 'ey12345abcdef.12345abcdef.authOnRenderRoute';
//   const mockConfigProvider = new MockConfigProvider();
//   const mockTokenProvider = new MockTokenProvider();
//   const provider = new HtmlPrinterProvider(mockConfigProvider, mockTokenProvider);

//   it('print a PDF', async () => {
//     const scope = nock(mockConfigProvider.get('url.printerUrl'))
//       .post('/print')
//       .reply(function(uri, requestBody) {
//         const { headers } = this.req;

//         // check the headers
//         expect(headers['accept']).to.eq('application/pdf');
//         expect(headers['authorization']).to.eq(`Bearer ${mockConfigProvider.get('token.render.bearer')}`);

//         // check the sent body
//         expect(requestBody).to.deep.eq({
//           uuid,
//           token,
//           api: mockConfigProvider.get('url.apiUrl'),
//         });

//         return [200, 'some pdf data'];
//       });

//     const data = await provider.pdf(uuid);
//     expect(data).to.be.an.instanceof(Buffer);
//     expect(data.toString()).to.eq('some pdf data');

//     scope.done();
//   });

//   it('print a PNG', async () => {
//     const scope = nock(mockConfigProvider.get('url.printerUrl'))
//       .post('/print')
//       .reply(function(uri, requestBody) {
//         const { headers } = this.req;

//         // check the headers
//         expect(headers['accept']).to.eq('image/png');
//         expect(headers['authorization']).to.eq(`Bearer ${mockConfigProvider.get('token.render.bearer')}`);

//         // check the sent body
//         expect(requestBody).to.deep.eq({
//           uuid,
//           token,
//           api: mockConfigProvider.get('url.apiUrl'),
//         });

//         return [200, 'some png data'];
//       });

//     const data = await provider.png(uuid);
//     expect(data).to.be.an.instanceof(Buffer);
//     expect(data.toString()).to.eq('some png data');

//     scope.done();
//   });
// });
