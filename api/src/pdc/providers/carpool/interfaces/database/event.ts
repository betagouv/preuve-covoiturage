import { CarpoolAcquisitionStatusEnum, Id } from '../common';

export interface InsertableCarpoolAcquisitionEvent {
  carpool_id: Id;
  request_id?: Id;
  status: CarpoolAcquisitionStatusEnum;
}
