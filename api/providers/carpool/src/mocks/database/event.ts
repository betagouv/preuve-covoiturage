import { CarpoolAcquisitionStatusEnum, InsertableCarpoolAcquisitionEvent } from '../../interfaces';

export const insertableAcquisitionEvent: InsertableCarpoolAcquisitionEvent = {
  carpool_id: 1,
  request_id: null,
  status: CarpoolAcquisitionStatusEnum.Canceled,
};
