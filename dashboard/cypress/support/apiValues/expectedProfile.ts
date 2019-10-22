import { UserRoleEnum } from '../../../src/app/core/enums/user/user-role.enum';

import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { cypress_logging_users } from '../stubs/auth/login';
import { User } from '../../../src/app/core/entities/authentication/user';
import {
  OPERATORS_PERMISSIONS,
  REGISTRY_PERMISSIONS,
  TERRITORIES_PERMISSIONS,
} from '../stubs/user/const/permissions.const';
import { operatorStub } from '../stubs/operator/operator.find';
import { territoryStub } from '../stubs/territory/territory.find';

export const expectedPatchedProfiles: { [key in UserGroupEnum]: User } = {
  territories: {
    _id: cypress_logging_users.territories._id,
    firstname: 'Jeanne',
    lastname: 'Boutrand',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.TERRITORY,
    permissions: TERRITORIES_PERMISSIONS.admin,
    territory: territoryStub._id,
  },
  operators: {
    _id: cypress_logging_users.operators._id,
    firstname: 'Jean',
    lastname: 'Christophe',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.OPERATOR,
    permissions: OPERATORS_PERMISSIONS.admin,
    operator: operatorStub._id,
  },
  registry: {
    _id: cypress_logging_users.registry._id,
    firstname: 'Elise',
    lastname: 'Karon',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.REGISTRY,
    permissions: REGISTRY_PERMISSIONS.admin,
  },
};
