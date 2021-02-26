import {
  channelServiceBlacklistMiddlewareBinding,
  channelServiceWhitelistMiddlewareBinding,
  contentBlacklistMiddlewareBinding,
  contentWhitelistMiddlewareBinding,
  copyFromContextMiddlewareBinding,
  environmentBlacklistMiddlewareBinding,
  environmentWhitelistMiddlewareBinding,
  hasPermissionMiddlewareBinding,
  hasPermissionByScopeMiddlewareBinding,
  validateDateMiddlewareBinding,
  loggerMiddlewareBinding,
} from './middlewares';

export const bindings = [
  channelServiceBlacklistMiddlewareBinding,
  channelServiceWhitelistMiddlewareBinding,
  contentBlacklistMiddlewareBinding,
  contentWhitelistMiddlewareBinding,
  copyFromContextMiddlewareBinding,
  environmentBlacklistMiddlewareBinding,
  environmentWhitelistMiddlewareBinding,
  hasPermissionMiddlewareBinding,
  hasPermissionByScopeMiddlewareBinding,
  validateDateMiddlewareBinding,
  loggerMiddlewareBinding,
];
