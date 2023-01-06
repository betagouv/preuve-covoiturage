import S3 from 'aws-sdk/clients/s3';
import { SerializedPolicyInterface } from '..';
import { EnrichedFundingRequestType } from '../../shared/policy/fundingRequestsList.contract';

export abstract class FundingRequestsRepositoryProviderInterfaceResolver {
  abstract findByCampaign(campaign: SerializedPolicyInterface): Promise<S3.ObjectList>;
  abstract campaignsFilter(campaigns: number[]): (obj: EnrichedFundingRequestType) => boolean;
  abstract operatorsFilter(operators: number[]): (obj: EnrichedFundingRequestType) => boolean;
  abstract showCurrentMonthFilter(permissions: string[], show: boolean): (obj: EnrichedFundingRequestType) => boolean;
  abstract enrich(list: S3.ObjectList): Promise<EnrichedFundingRequestType[]>;
}
