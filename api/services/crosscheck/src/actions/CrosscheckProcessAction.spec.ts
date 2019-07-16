// import path from 'path';
// import chai from 'chai';
// import { describe } from 'mocha';

// import { provider, NewableType, ExtensionInterface, serviceProvider } from '@ilos/common';
// import { Extensions, Action } from '@ilos/core';
// import { EnvExtension } from '@ilos/env';
// import { ConfigExtension } from '@ilos/config';
// import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';

// import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
// import { CrosscheckRepositoryProviderInterfaceResolver } from '../interfaces/CrosscheckRepositoryProviderInterface';
// import { TripInterface } from '../interfaces/TripInterface';
// import { Person, Trip } from '../entities/Trip';
// import { journey } from '../../tests/mocks/journey';
// import { CrosscheckProcessAction } from './CrosscheckProcessAction';
// import { trip as tripFactory } from '../../tests/mocks/trip';
// import { crosscheckProcessSchema } from '../schema/crosscheckProcessSchema';

// const { expect } = chai;

// const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
// process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
// process.env.APP_ENV = 'testing';
// process.env.APP_MONGO_DB = '';

// @provider({
//   identifier: CrosscheckRepositoryProviderInterfaceResolver,
// })
// class FakeCrosscheckRepository extends CrosscheckRepositoryProviderInterfaceResolver {
//   async boot() {
//     return;
//   }
//   public async create(trip: TripInterface): Promise<Trip> {
//     return new Trip({ ...trip, _id: '5d08a59aeb5e79d7607d29cd' });
//   }
// }

// @serviceProvider({
//   validator: [['crosscheck.process', crosscheckProcessSchema]],
//   middlewares: [['validate', ValidatorMiddleware]],
//   providers: [FakeCrosscheckRepository],
//   handlers: [CrosscheckProcessAction],
// })
// class ServiceProvider extends BaseServiceProvider {
//   readonly extensions: NewableType<ExtensionInterface>[] = [
//     EnvExtension,
//     ConfigExtension,
//     ValidatorExtension,
//     Extensions.Providers,
//     Extensions.Handlers,
//   ];
// }

// describe('Crosscheck Action - process', () => {
//   let sp: ServiceProvider;
//   let action: Action;

//   const mockJourney = {
//     ...journey,
//   };

//   before(async () => {
//     sp = new ServiceProvider();
//     await sp.register();
//     await sp.init();
//     action = sp.getContainer().get(CrosscheckProcessAction);
//   });

//   it('creates a trip', async () => {
//     const result = await action.call({
//       method: 'crosscheck:process',
//       params: {
//         journey: {
//           ...mockJourney,
//           otherKey: 'otherValue',
//         },
//       },
//       context: { call: { user: {} }, channel: { service: '' } },
//     });

//     expect(result).to.be.an.instanceof(Trip);
//     expect(result).to.have.property('_id');
//     expect(result.territories).to.eql(tripFactory.territories);
//     expect(result.status).to.eql(tripFactory.status);
//     expect(result.start).to.eql(tripFactory.start);

//     const passenger = <any>{
//       ...tripFactory.people[0],
//       start: { ...tripFactory.people[0].start },
//       end: { ...tripFactory.people[0].end },
//     };

//     const driver = <any>{
//       ...tripFactory.people[1],
//       start: { ...tripFactory.people[1].start },
//       end: { ...tripFactory.people[1].end },
//     };

//     expect(result.people[0]).to.eql(new Person(driver));
//     expect(result.people[1]).to.eql(new Person(passenger));
//   });
// });
