import {
  CarpoolAcquisitionStatusEnum,
  InsertableCarpoolAcquisitionStatus,
} from "../../interfaces/index.ts";

export const insertableAcquisitionStatus: InsertableCarpoolAcquisitionStatus = {
  carpool_id: 1,
  request_id: null,
  status: CarpoolAcquisitionStatusEnum.Canceled,
};
