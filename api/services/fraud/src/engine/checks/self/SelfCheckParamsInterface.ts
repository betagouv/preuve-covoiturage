export interface SelfCheckParamsInterface {
  driver_start_lat: number;
  driver_start_lon: number;
  driver_end_lat: number;
  driver_end_lon: number;
  driver_distance: number;
  driver_calc_distance?: number;
  driver_duration: number;
  driver_calc_duration?: number;
  passenger_start_lat: number;
  passenger_start_lon: number;
  passenger_end_lat: number;
  passenger_end_lon: number;
  passenger_distance: number;
  passenger_calc_distance?: number;
  passenger_duration: number;
  passenger_calc_duration?: number;
  passenger_seats: number;
}
