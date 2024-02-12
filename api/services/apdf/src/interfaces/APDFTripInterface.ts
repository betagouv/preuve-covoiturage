export interface APDFTripInterface {
  journey_id: string;
  start_datetime: string;
  end_datetime: string;
  rpc_incentive: number;
  start_location: string;
  start_insee: string;
  end_location: string;
  end_insee: string;
  duration: number;
  distance: number;
  operator: string;
  operator_class: string;
  trip_id: string;
  operator_trip_id: string;
  operator_driver_id: string;
  operator_passenger_id: string;
  incentive_type: 'normal' | 'booster';
  start_epci_name: string;
  start_epci: string;
  end_epci_name: string;
  end_epci: string;
}
