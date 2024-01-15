import { pick } from 'lodash';

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
  incentive: any; // JSON
  incentive_rpc: any; // JSON
  incentive_counterpart: any; // JSON

  offer_public: boolean;
  offer_accepted_at: Date;
};

export class CarpoolRow {
  constructor(protected data: CarpoolRowData) {}

  public addField(name: string, value: any): CarpoolRow {
    if (name in this.data) throw new Error(`Field ${name} already exists`);
    this.data[name] = value;

    return this;
  }

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
}
