// // tslint:disable max-classes-per-file
// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
// import { ConfigInterfaceResolver } from '@ilos/config';
// import { Container } from '@ilos/core';

// import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
// import { UserBaseInterface } from '../interfaces/UserInterfaces';
// import { UserResetPasswordParamsInterface } from '../interfaces/actions/UserResetPasswordParamsInterface';

// import { User } from '../entities/User';

// import { ResetPasswordUserAction } from './ResetPasswordUserAction';

// import { ServiceProvider as BaseServiceProvider } from '../ServiceProvider';

// import { mockNewUserBase } from '../../tests/mocks/newUserBase';
// import { defaultUserProperties } from '../../tests/mocks/defaultUserProperties';

// chai.use(chaiAsPromised);
// const { expect } = chai;

// const mockUser = {
//   ...mockNewUserBase,
//   _id: '5d08a43d282eeab274c2f3d7',
// };

// const mockResetPasswordParams = <UserResetPasswordParamsInterface>{
//   token: 'Txl6jbKHyIFNjBkWaeVmDbc7eaKDWnAK',
//   reset: 'S2A01eh84ba5pQ2b1kSVPSkaWnfR6EvH',
//   password: 'LE@XE:E88apg4.^',
// };

// const cryptedPassword = 'cryptedPassword';

// @Container.provider()
// class FakeUserRepository extends UserRepositoryProviderInterfaceResolver {
//   async boot() {
//     return;
//   }
//   public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
//     return new User({
//       ...mockUser,
//       forgottenAt: new Date(),
//     });
//   }

//   public async update(user: UserBaseInterface): Promise<User> {
//     return new User({
//       ...mockUser,
//     });
//   }
// }

// @Container.provider()
// class FakeCryptoProvider extends CryptoProviderInterfaceResolver {
//   async cryptPassword(plainPassword: string): Promise<string> {
//     return cryptedPassword;
//   }
//   async compareForgottenToken(plainToken: string, cryptedToken: string): Promise<boolean> {
//     return true;
//   }
// }

// @Container.provider()
// class FakeConfigProvider extends ConfigInterfaceResolver {
//   async boot() {
//     return;
//   }
//   get(key: string, fallback?: any): any {
//     if (key === 'user.tokenExpiration.passwordReset') {
//       return 86400;
//     }
//   }
// }

// class ServiceProvider extends BaseServiceProvider {
//   readonly handlers = [ResetPasswordUserAction];
//   readonly alias: any[] = [
//     [ConfigInterfaceResolver, FakeConfigProvider],
//     [CryptoProviderInterfaceResolver, FakeCryptoProvider],
//     [UserRepositoryProviderInterfaceResolver, FakeUserRepository],
//   ];

//   protected registerConfig() {}

//   protected registerTemplate() {}
// }

// let serviceProvider;
// let handlers;
// let action;

// describe('USER ACTION - Reset password', () => {
//   before(async () => {
//     serviceProvider = new ServiceProvider();
//     await serviceProvider.boot();
//     handlers = serviceProvider.getContainer().getHandlers();
//     action = serviceProvider.getContainer().getHandler(handlers[0]);
//   });
//   it('should work', async () => {
//     const result = await action.call({
//       method: 'user:resetPassword',
//       context: { call: { user: {}, channel: { service: '' } } },
//       params: mockResetPasswordParams,
//     });
//     expect(result).to.eql({
//       ...defaultUserProperties,
//       ...mockUser,
//     });
//   });
// });
