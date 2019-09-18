import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';
import { PermissionMiddleware } from '@ilos/package-acl';
import { MongoConnection } from '@ilos/connection-mongo';
import { ValidatorExtension, ValidatorMiddleware } from '@pdc/provider-validator';
import {
  campaignCreateSchema,
  campaignPatchSchema,
  campaignListSchema,
  campaignLaunchSchema,
} from '@pdc/provider-schema';
import { ScopeToSelfMiddleware } from '@pdc/provider-middleware';

import { CampaignRepositoryProvider } from './providers/CampaignRepositoryProvider';
import { CreateCampaignAction } from './actions/CreateCampaignAction';
import { PatchCampaignAction } from './actions/PatchCampaignAction';
import { LaunchCampaignAction } from './actions/LaunchCampaignAction';
import { ListCampaignAction } from './actions/ListCampaignAction';
import { ValidateRetributionInputMiddleware } from './middlewares/ValidateRetributionInputMiddleware';

@serviceProvider({
  config: __dirname,
  providers: [CampaignRepositoryProvider, ['validate.retribution', ValidateRetributionInputMiddleware]],
  validator: [
    ['campaign.create', campaignCreateSchema],
    ['campaign.patch', campaignPatchSchema],
    ['campaign.list', campaignListSchema],
    ['campaign.launch', campaignLaunchSchema],
  ],
  handlers: [CreateCampaignAction, PatchCampaignAction, LaunchCampaignAction, ListCampaignAction],
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
