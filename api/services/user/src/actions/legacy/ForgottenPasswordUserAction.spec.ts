// // tslint:disable max-classes-per-file
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
// import { Container, Interfaces, Types } from '@ilos/core';
// import { ConfigInterfaceResolver } from '@ilos/config';

// import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
// import { UserBaseInterface } from '../interfaces/UserInterfaces';

// import { ForgottenPasswordUserAction } from './ForgottenPasswordUserAction';

// import { User } from '../entities/User';

// import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

// import { mockConnectedUserBase } from '../../tests/mocks/connectedUserBase';
// import { mockNewUserBase } from '../../tests/mocks/newUserBase';

// chai.use(chaiAsPromised);
// const { expect } = chai;

// const mockConnectedUser = <UserBaseInterface>{
//   ...mockConnectedUserBase,
// };

// const mockUser = {
//   ...mockNewUserBase,
//   _id: 'mockUserId',
// };

// const mockForgottenPasswordParams = {
//   forgottenReset: 'KGthmwB33fGzJcfQmgQBokiBxDveMV79',
//   forgottenToken: 'dsBvJoswU2IeJBjtnZuUAoGFYPBsQs2E',
//   forgottenAt: new Date(),
// };

// @Container.provider()
// class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
//   async boot() {
//     return;
//   }
//   public async update(user: UserBaseInterface): Promise<User> {
//     return new User({
//       ...mockUser,
//       ...mockForgottenPasswordParams,
//     });
//   }
//   public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
//     return new User(mockUser);
//   }
// }

// @Container.provider()
// class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
//   generateToken(length?: number) {
//     const tokens = [
//       'oXYNxBM0c6yoOxG88Il6kObs4pzyPbYC',
//       'T1suv0YAB5oAjFCH8oUPGwkh8DkzBeAj',
//       'Mw8t5EdXwypN6G7PEFVnncWKDV8DjNZZ',
//       'RwjZZtctbjlju7Jq4Wdg9WBPUZhVrbBQ',
//     ];

//     return tokens[Math.floor(Math.random() * tokens.length)];
//   }
//   async cryptToken(plainToken: string): Promise<string> {
//     return mockForgottenPasswordParams.forgottenToken;
//   }
// }

// @Container.provider()
// class FakeKernelProvider extends Interfaces.KernelInterfaceResolver {
//   async boot() {
//     return;
//   }
//   async call(
//     method: string,
//     params: any[] | { [p: string]: any },
//     context: Types.ContextType,
//   ): Promise<Types.ResultType> {
//     return undefined;
//   }
// }

// @Container.provider()
// class FakeConfigProvider extends ConfigInterfaceResolver {
//   async boot() {
//     return;
//   }
//   get(key: string, fallback?: any): any {
//     return 'https://app.covoiturage.beta.gouv.fr';
//   }
// }

// class ServiceProvider extends BaseServiceProvider {
//   readonly handlers = [ForgottenPasswordUserAction];
//   readonly alias: any[] = [
//     [ConfigInterfaceResolver, FakeConfigProvider],
//     [CryptoProviderInterfaceResolver, FakeCryptoProvider],
//     [Interfaces.KernelInterfaceResolver, FakeKernelProvider],
//     [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
//   ];

//   protected registerConfig() {}

//   protected registerTemplate() {}
// }

// let serviceProvider;
// let handlers;
// let action;

// describe('USER ACTION - Forgotten password', () => {
//   before(async () => {
//     serviceProvider = new ServiceProvider();
//     await serviceProvider.boot();
//     handlers = serviceProvider.getContainer().getHandlers();
//     action = serviceProvider.getContainer().getHandler(handlers[0]);
//   });
//   it('should update user properties', async () => {
//     const result = await action.call({
//       method: 'user:deleteUser',
//       context: { call: { user: mockConnectedUser }, channel: { service: '' } },
//       params: { email: mockUser.email },
//     });
//     expect(result).to.equal(undefined);
//   });
// });
