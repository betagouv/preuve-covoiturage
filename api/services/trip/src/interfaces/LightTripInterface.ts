export interface LightTripInterface {
  trip_id: string;
  start_town?: string;
  end_town?: string;
  start_datetime: Date;
  operator_id: number;
  incentives: any;
  operator_class: string;
}
