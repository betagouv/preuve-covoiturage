import { CarpoolAcquisitionStatusEnum, InsertableCarpoolAcquisitionStatus } from '../../interfaces';

export const insertableAcquisitionStatus: InsertableCarpoolAcquisitionStatus = {
  carpool_id: 1,
  request_id: null,
  status: CarpoolAcquisitionStatusEnum.Canceled,
};
