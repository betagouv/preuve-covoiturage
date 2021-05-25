import { Groups } from '~/core/enums/user/groups';

export enum UserManyRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
  DEMO = 'demo',
  TERRITORY = 'territory',
  OPERATOR = 'operator',
  REGISTRY = 'registry',
}

export const userGroupRole = {
  [Groups.Territory]: UserManyRoleEnum.TERRITORY,
  [Groups.Registry]: UserManyRoleEnum.REGISTRY,
  [Groups.Operator]: UserManyRoleEnum.OPERATOR,
};

export enum Roles {
  TerritoryUser = 'territory.user',
  TerritoryAdmin = 'territory.admin',
  TerritoryDemo = 'territory.demo',

  OperatorUser = 'operator.user',
  OperatorAdmin = 'operator.admin',

  RegistryUser = 'registry.user',
  RegistryAdmin = 'registry.admin',
}

export const USER_GROUP_ROLES = {
  territories: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN, UserManyRoleEnum.DEMO],
  registry: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN],
  operators: [UserManyRoleEnum.USER, UserManyRoleEnum.ADMIN],
};

export const USER_ROLES_FR = {
  user: 'Consultation',
  admin: 'Administrateur',
  demo: 'Découverte',
};
