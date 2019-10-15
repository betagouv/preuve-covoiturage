import {
  OperatorsPermissionsAdminType,
  OperatorsPermissionsUserType,
  RegistryPermissionsAdminType,
  RegistryPermissionsUserType,
  TerritoriesPermissionsAdminType,
  TerritoriesPermissionsUserType,
} from '../../../../src/app/core/types/permissionType';
import { operators, registry, territories } from '../../../../../api/services/user/src/config/permissions';

export const TERRITORIES_PERMISSIONS = {
  admin: <TerritoriesPermissionsAdminType[]>territories.admin.permissions,
  user: <TerritoriesPermissionsUserType[]>territories.user.permissions,
};

export const OPERATORS_PERMISSIONS = {
  admin: <OperatorsPermissionsAdminType[]>operators.admin.permissions,
  user: <OperatorsPermissionsUserType[]>operators.user.permissions,
};

export const REGISTRY_PERMISSIONS = {
  admin: <RegistryPermissionsAdminType[]>registry.admin.permissions,
  user: <RegistryPermissionsUserType[]>registry.user.permissions,
};
