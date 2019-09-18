import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { User } from '../../../src/app/core/entities/authentication/user';
import { OPERATORS_PERMISSIONS, REGISTRY_PERMISSIONS, TERRITORIES_PERMISSIONS } from './const/permissions.const';

// tslint:disable-next-line:variable-name
export const cypress_logging_users = {
  territory: new User({
    _id: 1,
    firstname: 'AOM',
    lastname: 'Decovoit',
    email: 'preuve.decovoit@yopmail.com',
    role: 'admin',
    group: 'territory',
    permissions: TERRITORIES_PERMISSIONS.admin,
  }),
  operator: new User({
    _id: 1,
    firstname: 'Opérateur',
    lastname: 'Decovoit',
    email: 'preuve.decovoit@yopmail.com',
    role: 'admin',
    group: 'operator',
    permissions: OPERATORS_PERMISSIONS.admin,
  }),
  registry: new User({
    _id: 1,
    firstname: 'Registre',
    lastname: 'admin',
    email: 'preuve.decovoit@yopmail.com',
    role: 'admin',
    group: 'registry',
    permissions: REGISTRY_PERMISSIONS.admin,
  }),
};

export function stubLogin(type: UserGroupEnum) {
  cy.route({
    method: 'POST',
    url: '/login',
    response: (data) => ({
      payload: {
        data: cypress_logging_users[type],
      },
    }),
  });
}
