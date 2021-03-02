import { UserInterface } from '~/core/interfaces/user/profileInterface';
import { Groups } from '~/core/enums/user/groups';
import { Roles } from '~/core/enums/user/roles';

import { operatorStub } from '../stubs/operator/operator.find';
import { territoryStub } from '../stubs/territory/territory.find';

export const expectedNewUsers: { [key in Groups]: UserInterface } = {
  territories: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Territoire',
    group: Groups.Territory,
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: Roles.TerritoryAdmin,
    territory_id: territoryStub._id,
  },
  operators: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Opérateur',
    group: Groups.Operator,
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: Roles.OperatorAdmin,
    operator_id: operatorStub._id,
  },
  registry: <UserInterface>{
    firstname: 'Admin',
    lastname: 'Registre',
    group: Groups.Registry,
    phone: '0612345678',
    email: 'registredepreuve@yopmail.com',
    role: Roles.RegistryAdmin,
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
