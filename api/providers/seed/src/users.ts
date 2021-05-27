import { Territory, ileDeFrance } from './territories';

export const defaultStatus = 'active';
export const defaultPassword = '$2a$10$iSm6l7.Yb9n.peL2Sgf8PumUujREjnwfCjL6orAcGN0Iowv4fqPeO';
export const defaultRole = 'admin';

export interface User {
  email: string;
  firstname: string;
  lastname: string;
  status: string;
  role: string;
  password: string;
  territory?: Territory;
  operator?: any;
}

function makeUser(role: string, user: Partial<User> = {}): User {
  const name = (user.territory ? user.territory.name : user.operator ? user.operator.name : 'registry')
    .replace(' ', '')
    .toLowerCase();
  return {
    email: `${role}.${name}@example.com`,
    firstname: role,
    lastname: name,
    status: defaultStatus,
    role: role,
    password: defaultPassword,
    ...user,
  };
}

export const adminRegistry = makeUser('admin');
export const adminIleDeFrance = makeUser('admin', { territory: ileDeFrance });

export const users: User[] = [adminRegistry, adminIleDeFrance];
