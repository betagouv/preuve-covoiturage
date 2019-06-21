// // tslint:disable max-classes-per-file
// import chai from 'chai';
// import * as _ from 'lodash';
// import { Container, Interfaces, Types } from '@ilos/core';
// import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
// import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
// import { ValidatorProviderInterfaceResolver, ValidatorProvider } from '@ilos/provider-validator';
//
// import { journey } from '../../tests/mocks/journey';
// import { positionPaths } from '../config/normalization';
// import { NormalizationGeoAction } from './NormalizationGeoAction';
// import { ServiceProvider as BaseServiceProvider } from '../../../user/src/ServiceProvider';
// import { FindUserAction } from '../../../user/src/actions/FindUserAction';
// import { UserRepositoryProviderInterfaceResolver } from '../../../user/src/interfaces/repository/UserRepositoryProviderInterface';
//
// const { expect } = chai;
//
// @Container.provider()
// class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
//   async notify(method: string, params: any[] | { [p: string]: any }, context: Types.ContextType): Promise<void> {
//     return;
//   }
// }
//
// @Container.provider()
// class FakeGeoProvider extends GeoProviderInterfaceResolver {
//   public async getTown({ lon, lat, insee, literal }: any): Promise<any> {
//     return {
//       lon: 5.3682,
//       lat: 43.2392,
//       country: 'France',
//       insee: '13208',
//       town: 'Marseille',
//       postcodes: ['13008'],
//     };
//   }
// }
//
// @Container.provider()
// class FakeConfigProvider extends ConfigProviderInterfaceResolver {
//   async boot(): Promise<void> {
//     return;
//   }
//   get(_key, fallback) {
//     return fallback;
//   }
// }
//
//
//
// class ServiceProvider extends BaseServiceProvider {
//   readonly handlers = [FindUserAction];
//   readonly alias: any[] = [
//     [ConfigProviderInterfaceResolver, FakeConfigProvider],
//     [ValidatorProviderInterfaceResolver, ValidatorProvider],
//     [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
//   ];
//
//   protected registerConfig() {}
// }
//
// let serviceProvider;
//
//
// const journeyMarseilleLyon = { ...journey };
//
// positionPaths.map((path:string) => {
//   _.set(journeyMarseilleLyon, `${path}lon`, 5.3682);
//   _.set(journeyMarseilleLyon, `${path}lat`, 43.2392);
// });
//
// const normalizationProcessAction = new NormalizationGeoAction(new FakeKernelProvider(), new FakeGeoProvider());
//
//
// const mockProcessNormalizationParams = {
//   journey,
// };
//
// describe('NORMALIZATION ACTION - geo', () => {
//   before(() => {
//
//   });
//   it('should find town and complete passenger & driver position', async () => {
//     const result = await normalizationProcessAction.normalizeGeo({
//       ...journeyMarseilleLyon,
//     });
//
//     const expectedResult = { ...journeyMarseilleLyon };
//
//
//     positionPaths.map((path:string) => {
//       _.set(expectedResult,
//         path,
//         {
//         lon: 5.3682,
//           lat: 43.2392,
//         country: 'France',
//         insee: '13208',
//         town: 'Marseille',
//         postcodes: ['13008'],
//       });
//     });
//
//     nockRequest.on('request', (req, interceptor, body) => {
//       console.log(req);
//     });
//
//     expect(result).to.eql(expectedResult);
//   });
// });
