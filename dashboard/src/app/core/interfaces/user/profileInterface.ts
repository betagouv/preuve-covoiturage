import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import {
  OperatorsPermissionsAdminType,
  OperatorsPermissionsUserType,
  RegistryPermissionsAdminType,
  RegistryPermissionsUserType,
  TerritoriesPermissionsAdminType,
  TerritoriesPermissionsUserType,
} from '~/core/types/permissionType';

export interface ProfileInterface {
  email: string;
  lastname: string;
  firstname: string;
  phone: string;
}

export interface UserInterface {
  _id: string;
  email: string;
  lastname: string;
  firstname: string;
  phone: string;
  group: UserGroupEnum;
  role: UserRoleEnum;
  operator?: string;
  territory?: string;
  permissions: UserPermissionsType;
}

export type UserPermissionsType =
  | TerritoriesPermissionsAdminType[]
  | TerritoriesPermissionsUserType[]
  | OperatorsPermissionsAdminType[]
  | OperatorsPermissionsUserType[]
  | RegistryPermissionsAdminType[]
  | RegistryPermissionsUserType[];
