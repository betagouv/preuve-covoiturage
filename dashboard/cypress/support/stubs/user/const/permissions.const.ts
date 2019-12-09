import {
  OperatorsPermissionsAdminType,
  OperatorsPermissionsUserType,
  RegistryPermissionsAdminType,
  RegistryPermissionsUserType,
  TerritoriesPermissionsAdminType,
  TerritoriesPermissionsUserType,
} from '~/core/types/permissionType';

import { operator, registry, territory } from '../../../../../../api/services/user/src/config/permissions';

export const TERRITORIES_PERMISSIONS = {
  admin: <TerritoriesPermissionsAdminType[]>territory.admin.permissions,
  user: <TerritoriesPermissionsUserType[]>territory.user.permissions,
};

export const OPERATORS_PERMISSIONS = {
  admin: <OperatorsPermissionsAdminType[]>operator.admin.permissions,
  user: <OperatorsPermissionsUserType[]>operator.user.permissions,
};

export const REGISTRY_PERMISSIONS = {
  admin: <RegistryPermissionsAdminType[]>registry.admin.permissions,
  user: <RegistryPermissionsUserType[]>registry.user.permissions,
};
