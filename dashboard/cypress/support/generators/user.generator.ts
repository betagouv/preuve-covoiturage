import { USER_GROUPS, UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { ProfileInterface } from '~/core/interfaces/user/profileInterface';
import { User } from '~/core/entities/authentication/user';

import { cypress_logging_users } from '../stubs/auth/login';
import {
  OPERATORS_PERMISSIONS,
  REGISTRY_PERMISSIONS,
  TERRITORIES_PERMISSIONS,
} from '../stubs/user/const/permissions.const';
import { territoryStub } from '../stubs/territory/territory.find';
import { operatorStub } from '../stubs/operator/operator.find';
import { FIRSTNAMES } from './const/firstnames.const';
import { LASTNAMES } from './const/lastnames.const';
import { generateRandomMongoId } from './id.generator';

export class UserGenerator {
  static numberOfUsers = 20;

  static generateUser(profilData: ProfileInterface, group: UserGroupEnum) {
    const randomId = generateRandomMongoId();

    switch (group) {
      case UserGroupEnum.TERRITORY:
        return new User({
          _id: randomId,
          ...profilData,
          role: UserRoleEnum.ADMIN,
          group: UserGroupEnum.TERRITORY,
          permissions: TERRITORIES_PERMISSIONS.admin,
          territory: territoryStub._id,
        });
      case UserGroupEnum.OPERATOR:
        return new User({
          _id: randomId,
          ...profilData,
          role: UserRoleEnum.ADMIN,
          group: UserGroupEnum.OPERATOR,
          permissions: OPERATORS_PERMISSIONS.admin,
          operator: operatorStub._id,
        });
      case UserGroupEnum.REGISTRY:
        return new User({
          _id: randomId,
          ...profilData,
          role: UserRoleEnum.ADMIN,
          group: UserGroupEnum.REGISTRY,
          permissions: REGISTRY_PERMISSIONS.admin,
        });
    }
  }

  static generateList(group: UserGroupEnum) {
    const list = [];

    list.push(cypress_logging_users[group]);

    for (let i = 0; i < UserGenerator.numberOfUsers - 1; i += 1) {
      const firstname = FIRSTNAMES[Math.floor(Math.random() * FIRSTNAMES.length)];
      const lastname = LASTNAMES[Math.floor(Math.random() * FIRSTNAMES.length)];
      const profilData: ProfileInterface = {
        firstname,
        lastname,
        email: `${firstname}.${lastname}@yopmail.com`,
        phone: `07${Math.floor(Math.random() * 10000000)}`,
      };
      const grp = USER_GROUPS[Math.floor(Math.random() * 3)];
      list.push(UserGenerator.generateUser(profilData, grp));
    }

    return list;
  }
}
