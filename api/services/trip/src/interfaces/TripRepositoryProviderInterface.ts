import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { LightTripInterface } from '../shared/trip/common/interfaces/LightTripInterface';
import {
  TripSearchInterface,
  TripSearchInterfaceWithPagination,
} from '../shared/trip/common/interfaces/TripSearchInterface';
import { PgCursorHandler } from './PromisifiedPgCursor';
import { FinancialStatInterface, StatInterface } from './StatInterface';

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

export interface TripRepositoryInterface {
  stats(params: Partial<TripSearchInterface>): Promise<StatInterface[]>;
  financialStats(params: Partial<TripSearchInterface>): Promise<FinancialStatInterface[]>;
  searchCount(params: Partial<TripSearchInterfaceWithPagination>): Promise<{ count: string }>;
  search(params: Partial<TripSearchInterfaceWithPagination>): Promise<ResultWithPagination<LightTripInterface>>;
  searchWithCursor(
    params: {
      territory_authorized_operator_id?: number[];
      date: { start: Date; end: Date };
      operator_id?: number[];
      territory_id?: number[];
      status?: string;
    },
    type?: string,
  ): Promise<PgCursorHandler>;
  validateTz(tz?: string): Promise<TzResultInterface>;
  getPolicyInvolvedOperators(campaign_id: number, start_date: Date, end_date: Date): Promise<number[]>;
  getPolicyTripCount(params: CampaignSearchParamsInterface): Promise<number>;
  getPolicyTotalAmount(params: CampaignSearchParamsInterface): Promise<number>;
}
export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryInterface {
  public async stats(params: Partial<TripSearchInterface>): Promise<StatInterface[]> {
    throw new Error();
  }

  public async financialStats(params: Partial<TripSearchInterface>): Promise<FinancialStatInterface[]> {
    throw new Error();
  }

  public async searchCount(params: Partial<TripSearchInterfaceWithPagination>): Promise<{ count: string }> {
    throw new Error('Not implemented');
  }

  public async search(
    params: Partial<TripSearchInterfaceWithPagination>,
  ): Promise<ResultWithPagination<LightTripInterface>> {
    throw new Error('Not implemented');
  }

  public async searchWithCursor(
    params: {
      date: { start: Date; end: Date };
      territory_authorized_operator_id?: number[];
      operator_id?: number[];
      territory_id?: number[];
      status?: string;
    },
    type?: string,
  ): Promise<PgCursorHandler> {
    throw new Error('Not implemented');
  }

  public async validateTz(tz?: string): Promise<TzResultInterface> {
    throw new Error('Not implemented');
  }

  public async getTerritoryDescendants(territory_id: number): Promise<number[]> {
    throw new Error('Not implemented');
  }

  public async getPolicyInvolvedOperators(
    campaign_id: number,
    start_date: Date,
    end_date: Date,
    operatorsSiret?: Array<string>,
  ): Promise<number[]> {
    throw new Error('Not implemented');
  }

  public async getPolicyTripCount(params: CampaignSearchParamsInterface): Promise<number> {
    throw new Error('Not implemented');
  }
  public async getPolicyTotalAmount(params: CampaignSearchParamsInterface): Promise<number> {
    throw new Error('Not implemented');
  }
}
