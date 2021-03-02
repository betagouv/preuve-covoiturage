import { Groups } from '~/core/enums/user/groups';
import { User } from '~/core/entities/authentication/user';
import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { Roles } from '~/core/enums/user/roles';

import { OPERATORS_PERMISSIONS, REGISTRY_PERMISSIONS, TERRITORIES_PERMISSIONS } from '../user/const/permissions.const';
import { operatorStub } from '../operator/operator.find';
import { territoryStub } from '../territory/territory.find';

// tslint:disable-next-line:variable-name
export const cypress_logging_users: { [key in Groups]: User } = {
  territories: {
    _id: 1,
    firstname: 'AOM',
    lastname: 'Decovoit',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: Roles.TerritoryAdmin,
    group: Groups.Territory,
    permissions: TERRITORIES_PERMISSIONS.admin,
    territory_id: territoryStub._id,
  },
  operators: {
    _id: 2,
    firstname: 'Opérateur',
    lastname: 'Decovoit',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: Roles.OperatorAdmin,
    group: Groups.Operator,
    permissions: OPERATORS_PERMISSIONS.admin,
    operator_id: operatorStub._id,
  },
  registry: {
    _id: 3,
    firstname: 'Registre',
    lastname: 'admin',
    phone: '0612345678',
    email: 'preuve.decovoit@yopmail.com',
    role: Roles.RegistryAdmin,
    group: Groups.Registry,
    permissions: REGISTRY_PERMISSIONS.admin,
  },
};

export function stubLogin(type: Groups) {
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
