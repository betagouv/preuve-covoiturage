import { UserInterface } from '~/core/interfaces/user/profileInterface';

import { UserRoleEnum } from '../../../src/app/core/enums/user/user-role.enum';
import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';

import { operatorStub } from '../stubs/operator/operator.find';
import { territoryStub } from '../stubs/territory/territory.find';

export const expectedNewUsers: { [key in UserGroupEnum]: UserInterface } = {
  territories: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Territoire',
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: UserRoleEnum.TERRITORY_ADMIN,
    territory_id: territoryStub._id,
  },
  operators: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Opérateur',
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: UserRoleEnum.OPERATOR_ADMIN,
    operator_id: operatorStub._id,
  },
  registry: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Registre',
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: UserRoleEnum.REGISTRY_ADMIN,
  },
};

// export const expectedPatchedUsers: { [key in UserGroupEnum]: User } = {
//   territories: {
//     _id: cypress_logging_users.territories._id,
//     firstname: 'Admin Modifié',
//     lastname: 'Territoire Modifié',
//     phone: '0612345679',
//     email: 'registredepreuve@yopmail.com',
//     role: UserRoleEnum.TERRITORY_ADMIN,
//     group: UserGroupEnum.TERRITORY,
//     permissions: TERRITORIES_PERMISSIONS.admin,
//     territory_id: territoryStub._id,
//   },
//   operators: {
//     _id: cypress_logging_users.operators._id,
//     firstname: 'Admin Modifié',
//     lastname: 'Opérateur Modifié',
//     phone: '0612345679',
//     email: 'registredepreuve@yopmail.com',
//     role: UserRoleEnum.OPERATOR_ADMIN,
//     group: UserGroupEnum.OPERATOR,
//     permissions: OPERATORS_PERMISSIONS.admin,
//     operator_id: operatorStub._id,
//   },
//   registry: {
//     _id: cypress_logging_users.registry._id,
//     firstname: 'Admin Modifié',
//     lastname: 'Registre Modifié',
//     phone: '0612345679',
//     email: 'registredepreuve@yopmail.com',
//     role: UserRoleEnum.REGISTRY_ADMIN,
//     group: UserGroupEnum.REGISTRY,
//     permissions: REGISTRY_PERMISSIONS.admin,
//   },
// };
