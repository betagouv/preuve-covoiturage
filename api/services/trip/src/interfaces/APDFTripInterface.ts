export interface APDFTripInterface {
  journey_id: string;
  start_datetime: string;
  end_datetime: string;
  driver_rpc_incentive: number;
  passenger_rpc_incentive: number;
  start_location: string;
  start_insee: string;
  end_location: string;
  end_insee: string;
  duration: number;
  distance: number;
  operator_class: string;
  trip_id: string;
  operator_trip_id: string;
  driver_uuid: string;
  operator_driver_id: string;
  passenger_uuid: string;
  operator_passenger_id: string;
}
