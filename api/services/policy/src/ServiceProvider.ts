import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  campaignCreateSchema,
  campaignPatchSchema,
  campaignLaunchSchema,
  campaignDeleteSchema,
  campaignListTemplateSchema,
} from '@pdc/provider-schema';
import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { CreateCampaignAction } from './actions/CreateCampaignAction';
import { PatchCampaignAction } from './actions/PatchCampaignAction';
import { LaunchCampaignAction } from './actions/LaunchCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { ListCampaignTemplateAction } from './actions/ListCampaignTemplateAction';
import { DeleteCampaignAction } from './actions/DeleteCampaignAction';

import { CampaignRepositoryProvider } from './providers/CampaignRepositoryProvider';
import { ValidateRuleParametersMiddleware } from './middlewares/ValidateRuleParametersMiddleware';
import { PolicyEngine } from './engine/PolicyEngine';
import { CampaignMetadataRepositoryProvider } from './engine/CampaignMetadataRepositoryProvider';

@serviceProvider({
  config: __dirname,
  providers: [
    CampaignRepositoryProvider,
    CampaignMetadataRepositoryProvider,
    ['validate.rules', ValidateRuleParametersMiddleware],
    PolicyEngine,
  ],
  validator: [
    ['campaign.create', campaignCreateSchema],
    ['campaign.patch', campaignPatchSchema],
    ['campaign.launch', campaignLaunchSchema],
    ['campaign.delete', campaignDeleteSchema],
    ['campaign.listTemplate', campaignListTemplateSchema],
  ],
  handlers: [
    CreateCampaignAction,
    PatchCampaignAction,
    LaunchCampaignAction,
    DeleteCampaignAction,
    ListCampaignAction,
    ListCampaignTemplateAction,
  ],
  connections: [[MongoConnection, 'mongo']],
  middlewares: [
    ['can', PermissionMiddleware],
    ['validate', ValidatorMiddleware],
    ['scope.it', ScopeToSelfMiddleware],
    // ['validate.retribution', ValidateRetributionInputMiddleware],
  ],
})
export class ServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [ValidatorExtension];
}
