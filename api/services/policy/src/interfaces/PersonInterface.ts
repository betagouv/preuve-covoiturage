export interface PersonInterface {
  identity_uuid: string;
  is_over_18: boolean | null;
  has_travel_pass: boolean;
  acquisition_id: number;
  operator_id: number;
  operator_class: string;
  is_driver: boolean;
  datetime: Date;
  start_insee: string;
  end_insee: string;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
}
