export enum UserRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
}

export const USER_ROLES: UserRoleEnum[] = Object.values(UserRoleEnum);

export const USER_ROLES_FR = {
  user: 'consultation',
  admin: 'administrateur',
};
