import { channelServiceBlacklistMiddleware } from './ChannelService/ChannelServiceBlacklistMiddleware';
import { ListOfConfiguredMiddlewares } from './interfaces';
import {
  ChannelServiceWhitelistMiddlewareParams,
  channelServiceWhitelistMiddleware,
  CopyFromContextMiddlewareParams,
  copyFromContextMiddleware,
  HasPermissionByScopeMiddlewareParams,
  hasPermissionByScopeMiddleware,
} from './middlewares';

function buildPathWithPrefix(key: string, prefix: string | null = null): string {
  if (!prefix) {
    return key;
  }
  return `${prefix}.${key}`;
}

export function copyGroupIdFromContextMiddlewares(
  groups = ['territory_id', 'operator_id'],
  targetPathPrefix: string = null,
  preserve = false,
): ListOfConfiguredMiddlewares<CopyFromContextMiddlewareParams> {
  const middlewareParameters = [];
  for (const group of groups) {
    middlewareParameters.push(
      copyFromContextMiddleware(`call.user.${group}`, buildPathWithPrefix(group, targetPathPrefix), preserve),
    );
  }

  return middlewareParameters;
}

export function groupPermissionMiddlewares(
  groups: { user?: string; territory?: string; operator?: string; registry?: string },
  targetPathPrefix: string = null,
): ListOfConfiguredMiddlewares<HasPermissionByScopeMiddlewareParams> {
  const middlewareParameters = [];

  const {
    user: userPermission,
    territory: territoryPermission,
    operator: operatorPermission,
    registry: registryPermission,
  } = groups;

  if (userPermission) {
    middlewareParameters.push([userPermission, 'call.user._id', buildPathWithPrefix('_id', targetPathPrefix)]);
  }

  if (territoryPermission) {
    middlewareParameters.push([
      territoryPermission,
      'call.user.territory_id',
      buildPathWithPrefix('territory_id', targetPathPrefix),
    ]);
  }

  if (operatorPermission) {
    middlewareParameters.push([
      operatorPermission,
      'call.user.operator_id',
      buildPathWithPrefix('operator_id', targetPathPrefix),
    ]);
  }

  return [hasPermissionByScopeMiddleware(registryPermission, ...middlewareParameters)];
}

export function copyGroupIdAndApplyGroupPermissionMiddlewares(
  groups: { user?: string; territory?: string; operator?: string; registry?: string },
  targetPathPrefix: string = null,
): ListOfConfiguredMiddlewares {
  const copyGroupsParam = [];

  if ('territory' in groups) {
    copyGroupsParam.push('territory_id');
  }

  if ('operator' in groups) {
    copyGroupsParam.push('operator_id');
  }

  if ('user' in groups) {
    copyGroupsParam.push('_id');
  }

  return [
    ...copyGroupIdFromContextMiddlewares(copyGroupsParam, targetPathPrefix, true),
    ...groupPermissionMiddlewares(groups, targetPathPrefix),
  ];
}

export function internalOnlyMiddlewares(
  ...services: string[]
): ListOfConfiguredMiddlewares<ChannelServiceWhitelistMiddlewareParams | ChannelServiceWhitelistMiddlewareParams> {
  return services.length
    ? [channelServiceWhitelistMiddleware(...services)]
    : [channelServiceBlacklistMiddleware('proxy')];
}
