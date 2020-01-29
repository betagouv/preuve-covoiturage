import { USER_GROUPS, UserGroupEnum } from '~/core/enums/user/user-group.enum';

export enum UserManyRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
  DEMO = 'demo',
  TERRITORY = 'territory',
  OPERATOR = 'operator',
  REGISTRY = 'registry',
}

export const userGroupRole = {
  [UserGroupEnum.TERRITORY]: UserManyRoleEnum.TERRITORY,
  [UserGroupEnum.REGISTRY]: UserManyRoleEnum.REGISTRY,
  [UserGroupEnum.OPERATOR]: UserManyRoleEnum.OPERATOR,
};

export enum UserRoleEnum {
  TERRITORY_USER = 'territory.user',
  OPERATOR_USER = 'operator.user',
  REGISTRY_USER = 'registry.user',
  TERRITORY_ADMIN = 'territory.admin',
  TERRITORY_DEMO = 'territory.demo',
  OPERATOR_ADMIN = 'operator.admin',
  REGISTRY_ADMIN = 'registry.admin',
}

export const USER_GROUP_ROLES = {
  territories: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN, UserManyRoleEnum.DEMO],
  registry: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN],
  operators: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN],
};

export const USER_ROLES_FR = {
  user: 'consultation',
  admin: 'administrateur',
  demo: 'Découverte',
  // admin: 'administrateur',
};
