export enum UserGroupEnum {
  TERRITORY = 'territory',
  OPERATOR = 'operator',
  REGISTRY = 'registry',
}

export const USER_GROUPS: UserGroupEnum[] = Object.values(UserGroupEnum);
