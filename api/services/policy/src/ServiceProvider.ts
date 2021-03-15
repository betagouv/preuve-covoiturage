import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { RedisConnection } from '@ilos/connection-redis';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { defaultMiddlewareBindings } from '@pdc/provider-middleware';

import { config } from './config';
import { binding as createSchemaBinding } from './shared/policy/create.schema';
import { binding as patchSchemaBinding } from './shared/policy/patch.schema';
import { binding as launchSchemaBinding } from './shared/policy/launch.schema';
import { binding as deleteSchemaBinding } from './shared/policy/delete.schema';
import { binding as listSchemaBinding } from './shared/policy/list.schema';
import { binding as templatesSchemaBinding } from './shared/policy/templates.schema';
import { binding as findSchemaBinding } from './shared/policy/find.schema';
import { binding as simulateOnSchemaBinding } from './shared/policy/simulateOn.schema';
import { binding as simulateOnFutureSchemaBinding } from './shared/policy/simulateOnFuture.schema';

import { CreateCampaignAction } from './actions/CreateCampaignAction';
import { PatchCampaignAction } from './actions/PatchCampaignAction';
import { LaunchCampaignAction } from './actions/LaunchCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { DeleteCampaignAction } from './actions/DeleteCampaignAction';
import { TemplatesCampaignAction } from './actions/TemplatesCampaignAction';
import { FindCampaignAction } from './actions/FindCampaignAction';
import { ApplyAction } from './actions/ApplyAction';
import { FinalizeAction } from './actions/FinalizeAction';
import { SimulateOnPastAction } from './actions/SimulateOnPastAction';
import { SimulateOnFakeAction } from './actions/SimulateOnFakeAction';
import { SimulateOnFutureAction } from './actions/SimulateOnFutureAction';

import { CampaignPgRepositoryProvider } from './providers/CampaignPgRepositoryProvider';
import { PolicyEngine } from './engine/PolicyEngine';
import { MetadataProvider } from './engine/meta/MetadataProvider';
import { IncentiveRepositoryProvider } from './providers/IncentiveRepositoryProvider';
import { TripRepositoryProvider } from './providers/TripRepositoryProvider';
import { TerritoryRepositoryProvider } from './providers/TerritoryRepositoryProvider';

import { validateRuleParametersMiddlewareBinding } from './middlewares/ValidateRuleParametersMiddleware';

import { PolicyProcessCommand } from './commands/PolicyProcessCommand';
import { SeedCommand } from './commands/SeedCommand';

@serviceProvider({
  config,
  commands: [PolicyProcessCommand, SeedCommand],
  providers: [
    CampaignPgRepositoryProvider,
    MetadataProvider,
    TripRepositoryProvider,
    PolicyEngine,
    IncentiveRepositoryProvider,
    TerritoryRepositoryProvider,
    validateRuleParametersMiddlewareBinding,
  ],
  validator: [
    createSchemaBinding,
    patchSchemaBinding,
    launchSchemaBinding,
    deleteSchemaBinding,
    listSchemaBinding,
    templatesSchemaBinding,
    findSchemaBinding,
    simulateOnSchemaBinding,
    simulateOnFutureSchemaBinding,
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
    FinalizeAction,
    SimulateOnPastAction,
    SimulateOnFakeAction,
    SimulateOnFutureAction,
  ],
  connections: [
    [PostgresConnection, 'connections.postgres'],
    [RedisConnection, 'connections.redis'],
  ],
  queues: ['campaign'],
  middlewares: [...defaultMiddlewareBindings, ['validate', ValidatorMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
