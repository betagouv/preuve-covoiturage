import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, CarpoolV1StatusEnum } from '../interfaces';

export function statusConverter(
  acquisition_status: CarpoolAcquisitionStatusEnum,
  fraud_status: CarpoolFraudStatusEnum,
): CarpoolV1StatusEnum {
  if (fraud_status === CarpoolFraudStatusEnum.Failed) {
    return CarpoolV1StatusEnum.FraudcheckError;
  }

  switch (acquisition_status) {
    case CarpoolAcquisitionStatusEnum.Received:
    case CarpoolAcquisitionStatusEnum.Updated:
    case CarpoolAcquisitionStatusEnum.Processed:
      return CarpoolV1StatusEnum.Ok;
    case CarpoolAcquisitionStatusEnum.Failed:
      return CarpoolV1StatusEnum.AnomalyError;
    case CarpoolAcquisitionStatusEnum.Canceled:
      return CarpoolV1StatusEnum.Canceled;
    case CarpoolAcquisitionStatusEnum.Expired:
      return CarpoolV1StatusEnum.Expired;
  }
}
