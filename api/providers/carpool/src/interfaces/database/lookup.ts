import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, CarpoolIncentiveStatusEnum, Id, Uuid } from '../common';
import { InsertableCarpool } from './carpool';

export interface SelectableCarpoolStatus {
  _id: Id;
  created_at: Date;
  updated_at: Date;
  operator_id: Id;
  operator_journey_id: Uuid;
  operator_trip_id: Uuid;
  acquisition_last_event_id: Id;
  acquisition_status: CarpoolAcquisitionStatusEnum;
  incentive_last_event_id: Id;
  incentive_status: CarpoolIncentiveStatusEnum;
  fraud_last_event_id: Id;
  fraud_status: CarpoolFraudStatusEnum;
}

export type SelectableCarpool = InsertableCarpool & SelectableCarpoolStatus;
