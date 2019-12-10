import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { binding as createSchemaBinding } from './shared/policy/create.schema';
import { binding as patchSchemaBinding } from './shared/policy/patch.schema';
import { binding as launchSchemaBinding } from './shared/policy/launch.schema';
import { binding as deleteSchemaBinding } from './shared/policy/delete.schema';
import { binding as listSchemaBinding } from './shared/policy/list.schema';

import { CreateCampaignAction } from './actions/CreateCampaignAction';
import { PatchCampaignAction } from './actions/PatchCampaignAction';
import { LaunchCampaignAction } from './actions/LaunchCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { DeleteCampaignAction } from './actions/DeleteCampaignAction';

import { CampaignPgRepositoryProvider } from './providers/CampaignPgRepositoryProvider';
import { ValidateRuleParametersMiddleware } from './middlewares/ValidateRuleParametersMiddleware';
import { PolicyEngine } from './engine/PolicyEngine';
import { CampaignMetadataRepositoryProvider } from './engine/CampaignMetadataRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [
    CampaignPgRepositoryProvider,
    CampaignMetadataRepositoryProvider,
    ['validate.rules', ValidateRuleParametersMiddleware],
    PolicyEngine,
  ],
  validator: [createSchemaBinding, patchSchemaBinding, launchSchemaBinding, deleteSchemaBinding, listSchemaBinding],
  handlers: [CreateCampaignAction, PatchCampaignAction, LaunchCampaignAction, DeleteCampaignAction, ListCampaignAction],
  connections: [[PostgresConnection, 'connections.postgres']],
  middlewares: [['can', PermissionMiddleware], ['validate', ValidatorMiddleware], ['scope.it', ScopeToSelfMiddleware]],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
