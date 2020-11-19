interface IncentiveInterface {
  siret: string;
  amount: number;
}

export interface ExportTripInterface<T = Date> {
  journey_id: string;
  trip_id: string;

  journey_start_datetime: T;
  journey_start_lon: string;
  journey_start_lat: string;
  journey_start_insee: string;
  journey_start_postalcode: string;
  journey_start_department: string;
  journey_start_town: string;
  journey_start_towngroup: string;
  journey_start_country: string;

  journey_end_datetime: T;
  journey_end_lon: string;
  journey_end_lat: string;
  journey_end_insee: string;
  journey_end_postalcode: string;
  journey_end_department: string;
  journey_end_town: string;
  journey_end_towngroup: string;
  journey_end_country: string;

  driver_card: boolean;
  passenger_card: boolean;
  passenger_over_18: boolean;
  passenger_seats: number;
  operator_class: string;

  journey_distance: number;
  journey_duration: number;
  journey_distance_anounced: number;
  journey_distance_calculated: number;
  journey_duration_anounced: number;
  journey_duration_calculated: number;

  passenger_id?: string;
  passenger_contribution?: number;
  passenger_incentive_raw?: IncentiveInterface[];
  passenger_incentive_rpc_raw?: IncentiveInterface[];

  driver_id?: string;
  driver_revenue?: number;
  driver_incentive_raw?: IncentiveInterface[];
  driver_incentive_rpc_raw?: IncentiveInterface[];
}
