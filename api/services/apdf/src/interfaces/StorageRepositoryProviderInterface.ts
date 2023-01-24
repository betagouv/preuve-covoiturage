import S3 from 'aws-sdk/clients/s3';
import { EnrichedApdfType } from '../shared/apdf/list.contract';

// TODO fix
export type SerializedPolicyInterface = any;

export abstract class StorageRepositoryProviderInterfaceResolver {
  abstract findByCampaign(campaign: SerializedPolicyInterface): Promise<S3.ObjectList>;
  abstract campaignsFilter(campaigns: number[]): (obj: EnrichedApdfType) => boolean;
  abstract operatorsFilter(operators: number[]): (obj: EnrichedApdfType) => boolean;
  abstract showCurrentMonthFilter(permissions: string[], show: boolean): (obj: EnrichedApdfType) => boolean;
  abstract enrich(list: S3.ObjectList): Promise<EnrichedApdfType[]>;
}
