export enum UserGroupEnum {
  TERRITORY = 'territory',
  OPERATOR = 'operator',
  REGISTRY = 'registry',
}

export const USER_GROUPS: UserGroupEnum[] = Object.values(UserGroupEnum);
export const USER_GROUPS_FR = {
  territory: 'Territoire',
  operator: 'Opérateur',
  registry: 'Registre',
};
