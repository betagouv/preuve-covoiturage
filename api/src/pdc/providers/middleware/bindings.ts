import {
  channelServiceBlacklistMiddlewareBinding,
  channelServiceWhitelistMiddlewareBinding,
  contentBlacklistMiddlewareBinding,
  contentWhitelistMiddlewareBinding,
  copyFromContextMiddlewareBinding,
  environmentBlacklistMiddlewareBinding,
  environmentWhitelistMiddlewareBinding,
  hasPermissionByScopeMiddlewareBinding,
  hasPermissionMiddlewareBinding,
  loggerMiddlewareBinding,
  validateDateMiddlewareBinding,
} from "./middlewares.ts";

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
