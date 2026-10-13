import {
  castToArrayMiddlewareBinding,
  channelServiceBlacklistMiddlewareBinding,
  channelServiceWhitelistMiddlewareBinding,
  contentBlacklistMiddlewareBinding,
  contentWhitelistMiddlewareBinding,
  copyFromContextMiddlewareBinding,
  enforceOperatorMiddlewareBinding,
  environmentBlacklistMiddlewareBinding,
  environmentWhitelistMiddlewareBinding,
  hasPermissionByScopeMiddlewareBinding,
  hasPermissionMiddlewareBinding,
  validateDateMiddlewareBinding,
} from "./middlewares.ts";

export const bindings = [
  castToArrayMiddlewareBinding,
  channelServiceBlacklistMiddlewareBinding,
  channelServiceWhitelistMiddlewareBinding,
  contentBlacklistMiddlewareBinding,
  contentWhitelistMiddlewareBinding,
  copyFromContextMiddlewareBinding,
  enforceOperatorMiddlewareBinding,
  environmentBlacklistMiddlewareBinding,
  environmentWhitelistMiddlewareBinding,
  hasPermissionByScopeMiddlewareBinding,
  hasPermissionMiddlewareBinding,
  validateDateMiddlewareBinding,
];
