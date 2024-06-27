import { CarpoolAcquisitionStatusEnum, Id } from "../common.ts";

export interface InsertableCarpoolAcquisitionStatus {
  carpool_id: Id;
  request_id?: Id;
  status: CarpoolAcquisitionStatusEnum;
}
