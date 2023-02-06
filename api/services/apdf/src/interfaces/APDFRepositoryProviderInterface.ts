import { PolicyStatsInterface } from '../shared/apdf/interfaces/PolicySliceStatInterface';
import { PgCursorHandler } from '../shared/common/PromisifiedPgCursor';
import { SliceInterface } from '../shared/policy/common/interfaces/SliceInterface';
import { APDFTripInterface } from './APDFTripInterface';

export interface TzResultInterface {
  name: string;
  utc_offset: string;
}

export interface CampaignSearchParamsInterface {
  campaign_id: number;
  operator_id: number;
  start_date: Date;
  end_date: Date;
}

export interface DataRepositoryInterface {
  getPolicyActiveOperators(campaign_id: number, start_date: Date, end_date: Date): Promise<number[]>;
  getPolicyStats(params: CampaignSearchParamsInterface, slices: SliceInterface[]): Promise<PolicyStatsInterface>;
  getPolicyCursor(params: CampaignSearchParamsInterface): Promise<PgCursorHandler<APDFTripInterface>>;
}

export abstract class DataRepositoryProviderInterfaceResolver implements DataRepositoryInterface {
  public async getPolicyActiveOperators(campaign_id: number, start_date: Date, end_date: Date): Promise<number[]> {
    throw new Error('Not implemented');
  }

  public async getPolicyStats(
    params: CampaignSearchParamsInterface,
    slices: SliceInterface[],
  ): Promise<PolicyStatsInterface> {
    throw new Error('Not implemented');
  }

  public async getPolicyCursor(params: CampaignSearchParamsInterface): Promise<PgCursorHandler<APDFTripInterface>> {
    throw new Error('Not implemented');
  }
}
