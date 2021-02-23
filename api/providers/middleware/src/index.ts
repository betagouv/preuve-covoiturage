import { ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams } from './ChannelService/ChannelServiceBlacklistMiddleware';
import { ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams } from './ChannelService/ChannelServiceWhitelistMiddleware';
import { ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams } from './Content/ContentBlacklistMiddleware';
import { ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams } from './Content/ContentWhitelistMiddleware';
import { CopyFromContextMiddleware, CopyFromContextMiddlewareParams } from './CopyFromContext/CopyFromContextMiddleware';
import { EnvironmentBlacklistMiddleware, EnvironmentBlacklistMiddlewareParams } from './Environment/EnvironmentBlacklistMiddleware';
import { EnvironmentWhitelistMiddleware, EnvironmentWhitelistMiddlewareParams } from './Environment/EnvironmentWhitelistMiddleware';
import { HasPermissionByScopeMiddleware, HasPermissionByScopeMiddlewareParams } from './HasPermissionByScope/HasPermissionByScopeMiddleware';
import { HasPermissionMiddleware, HasPermissionMiddlewareParams } from './HasPermission/HasPermissionMiddleware';
import { ValidateDateMiddleware, ValidateDateMiddlewareParams } from './ValidateDate/ValidateDateMiddleware';

export const defaultMiddlewareBindings = [
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['copy_from_context', CopyFromContextMiddleware],
    ['environment.except', EnvironmentBlacklistMiddleware],
    ['environment.only', EnvironmentWhitelistMiddleware],
    ['has_permission_by_scope', HasPermissionByScopeMiddleware],
    ['validate.date', ValidateDateMiddleware],
    ['has_permission', HasPermissionMiddleware],
    ['channel.service.except', ChannelServiceBlacklistMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
];

export {
    ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams,
    ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams,
    CopyFromContextMiddleware, CopyFromContextMiddlewareParams,
    EnvironmentBlacklistMiddleware, EnvironmentBlacklistMiddlewareParams,
    EnvironmentWhitelistMiddleware, EnvironmentWhitelistMiddlewareParams,
    HasPermissionByScopeMiddleware, HasPermissionByScopeMiddlewareParams,
    ValidateDateMiddleware, ValidateDateMiddlewareParams,
    HasPermissionMiddleware, HasPermissionMiddlewareParams,
    ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams,
    ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams,
};