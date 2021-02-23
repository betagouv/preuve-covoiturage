import { ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams } from './ContentBlacklist/ContentBlacklistMiddleware';
import { ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams } from './ContentWhitelist/ContentWhitelistMiddleware';
import { CopyFromContextMiddleware, CopyFromContextMiddlewareParams } from './CopyFromContext/CopyFromContextMiddleware';
import { EnvironmentBlacklistMiddleware, EnvironmentBlacklistMiddlewareParams } from './Environment/EnvironmentBlacklistMiddleware';
import { EnvironmentWhitelistMiddleware, EnvironmentWhitelistMiddlewareParams } from './Environment/EnvironmentWhitelistMiddleware';
import { ScopeToSelfMiddleware, ScopeToSelfMiddlewareParams } from './ScopeToSelf/ScopeToSelfMiddleware';
import { ValidateDateMiddleware, ValidateDateMiddlewareParams } from './ValidateDate/ValidateDateMiddleware';
import { HasPermissionMiddleware, HasPermissionMiddlewareParams } from './HasPermission/HasPermissionMiddleware';
import { ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams } from './ChannelService/ChannelServiceBlacklistMiddleware';
import { ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams } from './ChannelService/ChannelServiceWhitelistMiddleware';

export const defaultMiddlewareBindings = [
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['copy_from_context', CopyFromContextMiddleware],
    ['environment.except', EnvironmentBlacklistMiddleware],
    ['environment.only', EnvironmentWhitelistMiddleware],
    ['scope_it', ScopeToSelfMiddleware],
    ['validate.date', ValidateDateMiddleware],
    ['can', HasPermissionMiddleware],
    ['channel.service.except', ChannelServiceBlacklistMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
];

export {
    ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams,
    ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams,
    CopyFromContextMiddleware, CopyFromContextMiddlewareParams,
    EnvironmentBlacklistMiddleware, EnvironmentBlacklistMiddlewareParams,
    EnvironmentWhitelistMiddleware, EnvironmentWhitelistMiddlewareParams,
    ScopeToSelfMiddleware, ScopeToSelfMiddlewareParams,
    ValidateDateMiddleware, ValidateDateMiddlewareParams,
    HasPermissionMiddleware, HasPermissionMiddlewareParams,
    ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams,
    ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams,
};