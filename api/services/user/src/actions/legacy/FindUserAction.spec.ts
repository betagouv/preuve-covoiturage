// // tslint:disable max-classes-per-file
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { Container, Exceptions, Types } from '@ilos/core';
// import { ConfigInterfaceResolver } from '@ilos/config';

// import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
// import { UserBaseInterface } from '../interfaces/UserInterfaces';

// import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

// import { User } from '../entities/User';

// import { FindUserAction } from './FindUserAction';

// import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';
// import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
// import { mockNewUserBase } from '../../tests/mocks/newUserBase';

// chai.use(chaiAsPromised);
// const { expect } = chai;

// const mockConnectedUser = <UserBaseInterface>{
//   ...mockConnectedUserBase,
//   permissions: ['user.read'],
// };

// const mockUser = {
//   ...mockNewUserBase,
//   _id: '5d08a55046d4230ed634d9bd',
// };

// @Container.provider()
// class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
//   async boot(): Promise<void> {
//     return;
//   }
//   async findUser(id: string): Promise<User> {
//     return new User(mockUser);
//   }
// }

// @Container.provider()
// class FakeConfigProvider extends ConfigInterfaceResolver {
//   async boot(): Promise<void> {
//     return;
//   }
//   get(_key, fallback) {
//     return fallback;
//   }
// }

// class ServiceProvider extends BaseServiceProvider {
//   readonly handlers = [FindUserAction];
//   readonly alias: any[] = [
//     [ConfigInterfaceResolver, FakeConfigProvider],
//     [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
//   ];

//   protected registerConfig() {}

//   protected registerTemplate() {}
// }

// let serviceProvider;

// describe('USER ACTION - Find user', () => {
//   before(async () => {
//     serviceProvider = new ServiceProvider();
//     await serviceProvider.boot();
//   });

//   it('should find user by id', async () => {
//     const handlers = serviceProvider.getContainer().getHandlers();
//     const action = serviceProvider.getContainer().getHandler(handlers[0]);
//     const result = await action.call({
//       method: 'user:find',
//       context: { call: { user: mockConnectedUser }, channel: { service: '' } },
//       params: { _id: mockUser._id },
//     });
//     expect(result).to.eql({
//       ...defaultUserProperties,
//       ...mockUser,
//     });
//   });

//   it('should throw forbidden error', async () => {
//     const handlers = serviceProvider.getContainer().getHandlers();
//     const action = serviceProvider.getContainer().getHandler(handlers[0]);
//     await expect(
//       action.call({
//         method: 'user:find',
//         context: { call: { user: { ...mockConnectedUser, permissions: [] } }, channel: { service: '' } },
//         params: { _id: mockUser._id },
//       }),
//     ).to.rejectedWith(Exceptions.ForbiddenException);
//   });
// });
