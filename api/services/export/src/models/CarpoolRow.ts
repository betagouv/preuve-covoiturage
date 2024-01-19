import { pick } from 'lodash';

export type AllowedComputedFields = {
  campaign_mode: string;
  has_incentive: boolean;

  incentive_1_index: number;
  incentive_1_siret: string;
  incentive_1_amount: number;
  incentive_2_index: number;
  incentive_2_siret: string;
  incentive_2_amount: number;
  incentive_3_index: number;
  incentive_3_siret: string;
  incentive_3_amount: number;
  incentive_4_index: number;
  incentive_4_siret: string;
  incentive_4_amount: number;

  incentive_rpc_1_siret: string;
  incentive_rpc_1_amount: number;
  incentive_rpc_2_siret: string;
  incentive_rpc_2_amount: number;
  incentive_rpc_3_siret: string;
  incentive_rpc_3_amount: number;
  incentive_rpc_4_siret: string;
  incentive_rpc_4_amount: number;

  incentive_counterpart_1_siret: string;
  incentive_counterpart_1_amount: number;
  incentive_counterpart_2_siret: string;
  incentive_counterpart_2_amount: number;
};

export type CarpoolRowData = {
  trip_id: string;
  operator_journey_id: string;
  operator_class: string;
  status: string;

  start_datetime_utc: Date;
  start_date_utc: string;
  start_time_utc: string;
  end_datetime_utc: Date;
  end_date_utc: string;
  end_time_utc: string;
  duration: number;
  distance: number;

  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;

  start_insee: string;
  start_commune: string;
  start_departement: string;
  start_epci: string;
  start_aom: string;
  start_pays: string;
  end_insee: string;
  end_commune: string;
  end_departement: string;
  end_epci: string;
  end_aom: string;
  end_pays: string;

  operator: string;
  operator_passenger_id: string;
  operator_driver_id: string;

  driver_revenue: number;
  passenger_contribution: number;
  campaign_id: number;
  incentive: Array<Incentive>;
  incentive_rpc: Array<IncentiveRPC>;
  incentive_counterpart: Array<IncentiveCounterpart>;

  offer_public: boolean;
  offer_accepted_at: Date;
};

export type Incentive = {
  index: number;
  siret: string;
  amount: number;
};

export type IncentiveRPC = {
  siret: string;
  amount: number;
};

export type IncentiveCounterpart = {
  siret: string;
  amount: number;
  target: 'passenger' | 'driver';
};

export class CarpoolRow {
  constructor(protected data: CarpoolRowData) {}

  public get(fields: string[] | undefined): Partial<CarpoolRowData> {
    // TODO transform if needed (dates, etc...)

    // pick fields or return the whole data
    return fields.length ? pick(this.data, fields) : this.data;
  }

  // type makes sure the field exists in the root dataset to avoid having
  // computed properties calling each other and creating race conditions.
  public value<K extends keyof CarpoolRowData>(name: K): CarpoolRowData[K] | null {
    return this.data[name] ?? null;
  }

  public addField(name: string, value: any): CarpoolRow {
    if (name in this.data) throw new Error(`Field ${name} already exists`);
    this.data[name] = value;

    return this;
  }

  public hasIncentive(): boolean {
    return true; // TODO sum incentive and check if > 0
  }
}
