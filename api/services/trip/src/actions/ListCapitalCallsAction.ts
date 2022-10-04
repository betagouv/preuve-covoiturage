import S3 from 'aws-sdk/clients/s3';
import { ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { BucketName, S3StorageProvider } from '@pdc/provider-file';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';
import { handlerConfig, ParamsInterface, S3Object } from '../shared/capitalcall/list.contract';
@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.capitalcall.list',
      operator: 'operator.capitalcall.list',
      registry: 'registry.capitalcall.list',
    }),
  ],
})
export class ListCapitalCallAction extends Action {
  constructor(private s3StorageProvider: S3StorageProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<S3Object[]> {
    let s3ObjectList: S3.Object[];
    if (params.operator_id) {
      // operator
      s3ObjectList = await this.s3StorageProvider.findByOperator(params.operator_id);
      // filter by territory too
      if (params.territory_id) {
        s3ObjectList = s3ObjectList.filter((s3Object: S3.Object) => {
          return new RegExp(`^${params.territory_id}/apdf-${params.operator_id}`).test(s3Object.Key);
        });
      }
    } else if (params.territory_id) {
      // territory
      s3ObjectList = await this.s3StorageProvider.findByTerritory(params.territory_id);
    }

    return Promise.all(
      s3ObjectList.map(async (o) => {
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
