// // tslint:disable max-classes-per-file
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import chaiSubset from 'chai-subset';
// import { ConfigExtension, ConfigInterfaceResolver } from '@ilos/config';
// import { Container, Extensions, Interfaces, Parents } from '@ilos/core';
//
// import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
// import { UserBaseInterface } from '../interfaces/UserInterfaces';
// import { DeleteUserAction } from './DeleteUserAction';
// import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';
//
// import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
// import { mockNewUserBase } from '../../tests/mocks/newUserBase';
// import { FakeCryptoProvider, FakeKernel, FakeUserRepository } from '../../tests/providers/fakeUserProviders';
// import { CreateUserAction } from './CreateUserAction';
// import { EnvExtension } from '@ilos/env';
// import { ValidatorExtension } from '@pdc/provider-validator/dist';
//
// chai.use(chaiAsPromised);
// chai.use(chaiSubset);
// const { expect } = chai;
//
// const mockConnectedUser = <UserBaseInterface>{
//   ...mockConnectedUserBase,
//   permissions: ['user.delete'],
// };
//
// const mockUser = {
//   ...mockNewUserBase,
//   _id: '5d08a5746024760031b33629',
// };
//
// @Container.serviceProvider({
//   env: null,
//   config: {
//   },
//   providers: [FakeUserRepository, FakeCryptoProvider, FakeKernel],
//   handlers: [DeleteUserAction],
//   validator: [],
// })
// class ServiceProvider extends Parents.ServiceProvider {
//   readonly extensions: Interfaces.ExtensionStaticInterface[] = [
//     EnvExtension,
//     ConfigExtension,
//     ValidatorExtension,
//     Extensions.Providers,
//   ];
// }
//
// let serviceProvider;
// let handlers;
// let action;
//
// describe('USER ACTION - Delete user', () => {
//   before(async () => {
//     serviceProvider = new ServiceProvider();
//     await serviceProvider.boot();
//     handlers = serviceProvider.getContainer().getHandlers();
//     action = serviceProvider.getContainer().getHandler(handlers[0]);
//   });
//   it('permission "user.delete" should delete user', async () => {
//     const result = await action.call({
//       method: 'user:delete',
//       context: { call: { user: mockConnectedUser }, channel: { service: '' } },
//       params: { _id: mockUser._id },
//     });
//     expect(result).to.equal(undefined);
//   });
//   it('permission "profile.delete" should delete his profile', async () => {
//     const result = await action.call({
//       method: 'user:delete',
//       context: {
//         call: {
//           user: {
//             ...mockConnectedUser,
//             _id: mockUser._id,
//           },
//         },
//         channel: { service: '' },
//       },
//       params: { _id: mockUser._id },
//     });
//     expect(result).to.equal(undefined);
//   });
//   it('permission "territory.users.remove" should delete territory user', async () => {
//     const result = await action.call({
//       method: 'user:delete',
//       context: {
//         call: {
//           user: {
//             ...mockConnectedUser,
//             territory: 'territoryId',
//           },
//         },
//         channel: { service: '' },
//       },
//       params: {
//         _id: mockUser._id,
//       },
//     });
//     expect(result).to.equal(undefined);
//   });
// });
