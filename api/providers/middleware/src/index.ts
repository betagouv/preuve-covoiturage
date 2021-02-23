import { ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams } from './ContentBlacklist/ContentBlacklistMiddleware';
import { ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams } from './ContentWhitelist/ContentWhitelistMiddleware';
import { ContextExtractMiddleware, ContextExtractMiddlewareParams } from './ContextExtract/ContextExtractMiddleware';
import { FeatureFlagMiddleware, FeatureFlagMiddlewareParams } from './FeatureFlag/FeatureFlagMiddleware';
import { ScopeToSelfMiddleware, ScopeToSelfMiddlewareParams } from './ScopeToSelf/ScopeToSelfMiddleware';
import { ValidateDateMiddleware, ValidateDateMiddlewareParams } from './ValidateDate/ValidateDateMiddleware';
import { HasPermissionMiddleware, HasPermissionMiddlewareParams } from './HasPermission/HasPermissionMiddleware';
import { ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams } from './ChannelService/ChannelServiceBlacklistMiddleware';
import { ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams } from './ChannelService/ChannelServiceWhitelistMiddleware';

export const defaultMiddlewareBindings = [
    ['content.blacklist', ContentBlacklistMiddleware],
    ['content.whitelist', ContentWhitelistMiddleware],
    ['context_extract', ContextExtractMiddleware],
    ['featureflag', FeatureFlagMiddleware],
    ['scope_it', ScopeToSelfMiddleware],
    ['validate.date', ValidateDateMiddleware],
    ['can', HasPermissionMiddleware],
    ['channel.service.except', ChannelServiceBlacklistMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
];

export {
    ContentBlacklistMiddleware, ContentBlacklistMiddlewareParams,
    ContentWhitelistMiddleware, ContentWhitelistMiddlewareParams,
    ContextExtractMiddleware, ContextExtractMiddlewareParams,
    FeatureFlagMiddleware, FeatureFlagMiddlewareParams,
    ScopeToSelfMiddleware, ScopeToSelfMiddlewareParams,
    ValidateDateMiddleware, ValidateDateMiddlewareParams,
    HasPermissionMiddleware, HasPermissionMiddlewareParams,
    ChannelServiceBlacklistMiddleware, ChannelServiceBlacklistMiddlewareParams,
    ChannelServiceWhitelistMiddleware, ChannelServiceWhitelistMiddlewareParams,
};