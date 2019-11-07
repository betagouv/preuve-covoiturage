import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { User } from '~/core/entities/authentication/user';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';

import { OPERATORS_PERMISSIONS, REGISTRY_PERMISSIONS, TERRITORIES_PERMISSIONS } from '../user/const/permissions.const';
import { operatorStub } from '../operator/operator.find';
import { territoryStub } from '../territory/territory.find';

// tslint:disable-next-line:variable-name
export const cypress_logging_users: { [key in UserGroupEnum]: User } = {
  territories: {
    _id: '5d828c7c8b59373497d5a27f',
    firstname: 'AOM',
    lastname: 'Decovoit',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.TERRITORY,
    permissions: TERRITORIES_PERMISSIONS.admin,
    territory_id: territoryStub._id,
  },
  operators: {
    _id: '5d828c866707121bd1e23860',
    firstname: 'Opérateur',
    lastname: 'Decovoit',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.OPERATOR,
    permissions: OPERATORS_PERMISSIONS.admin,
    operator_id: operatorStub._id,
  },
  registry: {
    _id: '5d828c8f21577b76d5445e0c',
    firstname: 'Registre',
    lastname: 'admin',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: UserRoleEnum.ADMIN,
    group: UserGroupEnum.REGISTRY,
    permissions: REGISTRY_PERMISSIONS.admin,
  },
};

export function stubLogin(type: UserGroupEnum) {
  cy.route({
    method: 'POST',
    url: '/login',
    response: (data) =>
      <JsonRPCResponse>{
        id: 1,
        jsonrpc: '2.0',
        result: {
          data: cypress_logging_users[type],
          meta: null,
        },
      },
  });
}
