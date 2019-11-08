export interface LightTripInterface {
  trip_id: string;
  is_driver: boolean;
  start_town?: string;
  end_town?: string;
  start_datetime: Date;
  operator_id: string;
  incentives: any;
  operator_class: string;
}
