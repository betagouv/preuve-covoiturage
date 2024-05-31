import {
  CarpoolIncentive,
  Distance,
  Financial,
  Id,
  LicencePlate,
  Name,
  OperatorClass,
  Payment,
  Phone,
  Position,
  Seat,
  Uuid,
} from '../common.ts';

export interface InsertableCarpool {
  operator_id: Id;
  operator_journey_id: Uuid;
  operator_trip_id: Uuid;
  operator_class: OperatorClass;
  start_datetime: Date;
  start_position: Position;
  end_datetime: Date;
  end_position: Position;
  distance: Distance;
  licence_plate: LicencePlate;
  driver_identity_key: Uuid;
  driver_operator_user_id: Uuid;
  driver_phone: Phone;
  driver_phone_trunc: Phone;
  driver_travelpass_name: Name;
  driver_travelpass_user_id: Uuid;
  driver_revenue: Financial;
  passenger_identity_key: Uuid;
  passenger_operator_user_id: Uuid;
  passenger_phone: Phone;
  passenger_phone_trunc: Phone;
  passenger_travelpass_name: Name;
  passenger_travelpass_user_id: Uuid;
  passenger_over_18: boolean;
  passenger_seats: Seat;
  passenger_contribution: Financial;
  passenger_payments: Array<Payment>;
  incentives: Array<CarpoolIncentive>;
}

export interface UpdatableCarpool {
  operator_trip_id?: Uuid;
  operator_class?: OperatorClass;
  start_datetime?: Date;
  start_position?: Position;
  end_datetime?: Date;
  end_position?: Position;
  distance?: Distance;
  licence_plate?: LicencePlate;
  driver_identity_key?: Uuid;
  driver_operator_user_id?: Uuid;
  driver_phone?: Phone;
  driver_phone_trunc?: Phone;
  driver_travelpass_name?: Name;
  driver_travelpass_user_id?: Uuid;
  driver_revenue?: Financial;
  passenger_identity_key?: Uuid;
  passenger_operator_user_id?: Uuid;
  passenger_phone?: Phone;
  passenger_phone_trunc?: Phone;
  passenger_travelpass_name?: Name;
  passenger_travelpass_user_id?: Uuid;
  passenger_over_18?: boolean;
  passenger_seats?: Seat;
  passenger_contribution?: Financial;
  passenger_payments?: Array<Payment>;
  incentives?: Array<CarpoolIncentive>;
}

export interface WrittenCarpool {
  _id: Id;
  uuid: Uuid;
  created_at: Date;
  updated_at: Date;
}
