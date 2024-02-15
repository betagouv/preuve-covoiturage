export interface APDFTripInterface {
  operator_journey_id: string;
  operator_trip_id: string;
  trip_id: string;
  start_datetime: string;
  end_datetime: string;
  start_location: string;
  start_epci: string;
  start_insee: string;
  end_location: string;
  end_epci: string;
  end_insee: string;
  duration: number;
  distance: number;
  operator: string;
  operator_class: string;
  operator_driver_id: string;
  operator_passenger_id: string;
  rpc_incentive: number;
  incentive_type: 'normale' | 'booster';
}
