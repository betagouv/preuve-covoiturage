export enum Groups {
  Territory = 'territories',
  Operator = 'operators',
  Registry = 'registry',
}

export const USER_GROUPS: Groups[] = Object.values(Groups);
export const USER_GROUPS_FR = {
  territories: 'Territoire',
  operators: 'Opérateur',
  registry: 'Registre',
};
