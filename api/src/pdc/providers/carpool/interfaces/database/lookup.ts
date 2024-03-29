import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, Id, Uuid } from '../common';
import { InsertableCarpool } from './carpool';

export interface SelectableCarpoolStatus {
  _id: Id;
  created_at: Date;
  updated_at: Date;
  operator_id: Id;
  operator_journey_id: Uuid;
  operator_trip_id: Uuid;
  acquisition_status: CarpoolAcquisitionStatusEnum;
  fraud_status: CarpoolFraudStatusEnum;
}

export type SelectableCarpool = InsertableCarpool & SelectableCarpoolStatus;
