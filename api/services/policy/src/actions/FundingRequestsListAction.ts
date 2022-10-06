import S3 from 'aws-sdk/clients/s3';
import { Action } from '@ilos/core';
import { ContextType, handler, NotFoundException } from '@ilos/common';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, S3Object } from '../shared/policy/fundingRequestsList.contract';
import { IncentiveRepositoryProvider } from '../providers/IncentiveRepositoryProvider';
import { PolicyRepositoryProvider } from '../providers/PolicyRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.fundingRequestsList',
      operator: 'operator.policy.fundingRequestsList',
      registry: 'registry.policy.fundingRequestsList',
    }),
  ],
})
export class FundingRequestsListAction extends Action {
  constructor(
    private s3StorageProvider: S3StorageProvider,
    private incentiveProvider: IncentiveRepositoryProvider,
    private policyProvider: PolicyRepositoryProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<S3Object[]> {
    const { campaign_id: policy_id, operator_id } = params;
    const { territory_id } = await this.policyProvider.find(policy_id);

    if (!policy_id || !territory_id) {
      throw new NotFoundException(`Could not find campaign ${policy_id} and its territory`);
    }

    console.debug({ policy_id, operator_id, territory_id });

    // Scope to operator
    if (operator_id) {
      return this.generateLinks(
        (await this.s3StorageProvider.findByOperator(operator_id)).filter((s3Object: S3.Object) => {
          return new RegExp(`^${territory_id}/apdf-${operator_id}`).test(s3Object.Key);
        }),
      );
    }

    // find partner operators with valid incentives
    const partners = await this.incentiveProvider.getPolicyActiveOperators(policy_id);
    const list = await this.s3StorageProvider.findByTerritory(territory_id);
    const filt = list.filter(({ Key }: S3.Object) => {
      const ms = Key.match(new RegExp(`${territory_id}/apdf-([0-9]+)-`));
      return (Array.isArray(ms) && partners.indexOf(parseInt(ms[1], 10)) > -1) || false;
    });

    console.debug(filt.map((o) => o.Key));

    return this.generateLinks(filt);
  }

  private async generateLinks(list: S3.Object[]): Promise<S3Object[]> {
    return Promise.all(
      list.map(async (o) => {
        const object: S3Object = {
          signed_url: await this.s3StorageProvider.getSignedUrl(
            BucketName.Export,
            o.Key,
            S3StorageProvider.TEN_MINUTES,
          ),
          key: o.Key,
          size: o.Size,
        };
        return object;
      }),
    );
  }
}
