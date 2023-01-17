export interface APDFTripInterface {
  journey_id: string;
  trip_id: string;
  operator_trip_id: string;
  driver_uuid: string;
  operator_driver_id: string;
  driver_rpc_incentive: number;
  passenger_uuid: string;
  operator_passenger_id: string;
  passenger_rpc_incentive: number;
  start_datetime: string;
  end_datetime: string;
  duration: number;
  distance: number;
  operator_class: string;
}
