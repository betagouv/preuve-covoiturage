import {
  castToArrayMiddlewareBinding,
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
  castToArrayMiddlewareBinding,
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
];
