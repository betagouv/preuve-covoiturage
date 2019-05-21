// import chai from 'chai';
// import chaiAsPromised from 'chai-as-promised';
// import sinon from 'sinon';

// import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';
// import { CreateUserAction } from './CreateUserAction';
// import { User } from '../entities/User';

// chai.use(chaiAsPromised);
// const { expect, assert } = chai;

// const mockUser = {
//   email: 'john.schmidt@example.com',
//   firstname: 'john',
//   lastname: 'schmidt',
//   phone: '0624857425',
// };

// const fakeUserRepository = <UserRepositoryProvider>sinon.createStubInstance(UserRepositoryProvider, {
//   async create(user: User) {
//     return {
//       ...user,
//       _id: '1ab',
//     };
//   },
// });

// const action = new CreateUserAction(fakeUserRepository);

// describe('Create user action', () => {
//   it('should work', async () => {
//     const result = await action.handle({ user: mockUser });
//     expect(result).to.equal({ ...mockUser, _id: '1ab',  });
//   });
// });

