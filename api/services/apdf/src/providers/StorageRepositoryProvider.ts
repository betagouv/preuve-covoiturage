import { provider } from '@ilos/common';
import { S3, S3StorageProvider, BucketName, APDFNameProvider } from '@pdc/provider-file';
import { subMonths } from 'date-fns';
import {
  SerializedPolicyInterface,
  StorageRepositoryProviderInterfaceResolver,
} from '../interfaces/StorageRepositoryProviderInterface';
import { EnrichedApdfType } from '../shared/apdf/list.contract';

@provider({
  identifier: StorageRepositoryProviderInterfaceResolver,
})
export class StorageRepositoryProvider implements StorageRepositoryProviderInterfaceResolver {
  private bucket: BucketName = BucketName.APDF;

  constructor(private s3StorageProvider: S3StorageProvider, private APDFNameProvider: APDFNameProvider) {}

  async findByCampaign(campaign: SerializedPolicyInterface): Promise<S3.ObjectList> {
    try {
      const list = await this.s3StorageProvider.list(this.bucket, `${campaign._id}`);
      return list.filter((obj: S3.Object) => obj.Size > 0);
    } catch (e) {
      console.error(`[Apdf:StorageRepo:findByCampaign] ${e.message}`);
      console.debug(e.stack);
      throw e;
    }
  }

  async enrich(list: S3.ObjectList): Promise<EnrichedApdfType[]> {
    return Promise.all(
      list.map(async (o: S3.Object) => ({
        ...this.APDFNameProvider.parse(o.Key),
        signed_url: await this.s3StorageProvider.getSignedUrl(this.bucket, o.Key, S3StorageProvider.TEN_MINUTES),
        key: o.Key,
        size: o.Size,
      })),
    );
  }

  // use in a [].filter
  campaignsFilter(campaigns: number[]) {
    return (obj: EnrichedApdfType): boolean => {
      return campaigns.length ? campaigns.indexOf(obj.campaign_id) > -1 : true;
    };
  }

  // use in a [].filter
  operatorsFilter(operators: number[]) {
    return (obj: EnrichedApdfType): boolean => {
      return operators.length ? operators.indexOf(obj.operator_id) > -1 : true;
    };
  }

  // use in a [].filter
  showCurrentMonthFilter(permissions: string[], show: boolean) {
    return (obj: EnrichedApdfType): boolean => {
      // from config
      if (show) return true;

      // from permissions
      if (permissions.indexOf('registry.apdf.listCurrentMonth') > -1) {
        return true;
      }

      // show all but last month
      const fileMonth = obj.datetime.toISOString().substring(0, 7);
      const lastMonth = subMonths(new Date(), 1).toISOString().substring(0, 7);

      return fileMonth !== lastMonth;
    };
  }
}
