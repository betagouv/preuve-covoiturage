import { UserBaseInterface, UserInterface } from '../../src/interfaces/UserInterfaces';

export const mockCreateUserParams = <UserBaseInterface>{
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
};

export const password = 'LE@XE:E88apg4.^';
export const newPassword = 'AC@zefeEE.:';

export const mockConnectedUserBase = <UserInterface>{
  _id: '5d0b616f9f611aef34deb304',
  email: 'john.schmidt@example.com',
  firstname: 'john',
  lastname: 'schmidt',
  phone: '0624857425',
  group: 'registry',
  role: 'admin',
  permissions: ['user.list'],
};

export const mockUserBase = <UserInterface>{
  ...mockCreateUserParams,
  _id: '5d07f9c61cf0b9ce019da281',
  emailChangeAt: new Date(),
  emailConfirm: 'Y5ySSJRrlX49aSC9G1eIBb0dMWLv95aW',
  emailToken: 'W0mn7FUNQI53qAaKW8lxIiTB9b03GP1N',
  forgottenToken: 'S2A01eh84ba5pQ2b1kSVPSkaWnfR6EvH',
  forgottenReset: 'Txl6jbKHyIFNjBkWaeVmDbc7eaKDWnAK',
  permissions: [],
  password: 'cryptedPassword',
  role: 'admin',
  status: 'active',
  forgottenAt: new Date(),
};
