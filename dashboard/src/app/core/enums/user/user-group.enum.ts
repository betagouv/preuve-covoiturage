export enum UserGroupEnum {
  TERRITORY = 'territories',
  OPERATOR = 'operators',
  REGISTRY = 'registry',
}

export const USER_GROUPS: UserGroupEnum[] = Object.values(UserGroupEnum);
export const USER_GROUPS_FR = {
  territories: 'Territoire',
  operators: 'Opérateur',
  registry: 'Registre',
};
