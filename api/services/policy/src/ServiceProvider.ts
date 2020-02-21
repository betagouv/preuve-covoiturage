import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';

import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ScopeToSelfMiddleware, ChannelServiceWhitelistMiddleware } from '@pdc/provider-middleware';

import { binding as createSchemaBinding } from './shared/policy/create.schema';
import { binding as patchSchemaBinding } from './shared/policy/patch.schema';
import { binding as launchSchemaBinding } from './shared/policy/launch.schema';
import { binding as deleteSchemaBinding } from './shared/policy/delete.schema';
import { binding as listSchemaBinding } from './shared/policy/list.schema';
import { binding as templatesSchemaBinding } from './shared/policy/templates.schema';
import { binding as findSchemaBinding } from './shared/policy/find.schema';

import { CreateCampaignAction } from './actions/CreateCampaignAction';
import { PatchCampaignAction } from './actions/PatchCampaignAction';
import { LaunchCampaignAction } from './actions/LaunchCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { DeleteCampaignAction } from './actions/DeleteCampaignAction';
import { TemplatesCampaignAction } from './actions/TemplatesCampaignAction';
import { FindCampaignAction } from './actions/FindCampaignAction';

import { CampaignPgRepositoryProvider } from './providers/CampaignPgRepositoryProvider';
import { ValidateRuleParametersMiddleware } from './middlewares/ValidateRuleParametersMiddleware';
import { PolicyEngine } from './engine/PolicyEngine';
import { CampaignMetadataRepositoryProvider } from './engine/CampaignMetadataRepositoryProvider';
import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { ApplyAction } from './actions/ApplyAction';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { PolicyProcessCommand } from './commands/PolicyProcessCommand';
import { SeedCommand } from './commands/SeedCommand';

@serviceProvider({
  config: __dirname,
  commands: [PolicyProcessCommand, SeedCommand],
  providers: [
    CampaignPgRepositoryProvider,
    CampaignMetadataRepositoryProvider,
    TripRepositoryProvider,
    ['validate.rules', ValidateRuleParametersMiddleware],
    PolicyEngine,
    IncentiveRepositoryProvider,
  ],
  validator: [
    createSchemaBinding,
    patchSchemaBinding,
    launchSchemaBinding,
    deleteSchemaBinding,
    listSchemaBinding,
    templatesSchemaBinding,
    findSchemaBinding,
  ],
  handlers: [
    TemplatesCampaignAction,
    CreateCampaignAction,
    PatchCampaignAction,
    LaunchCampaignAction,
    DeleteCampaignAction,
    ListCampaignAction,
    FindCampaignAction,
    ApplyAction,
  ],
  connections: [[PostgresConnection, 'connections.postgres'], [RedisConnection, 'connections.redis']],
  queues: ['campaign'],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scope.it', ScopeToSelfMiddleware],
    ['channel.service.only', ChannelServiceWhitelistMiddleware],
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
