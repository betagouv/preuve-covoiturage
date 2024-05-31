import { CarpoolAcquisitionStatusEnum, CarpoolFraudStatusEnum, CarpoolV1StatusEnum } from '../interfaces/index.ts';

/**
 * Convert Carpool V2 statuses to Carpool V1 status
 *
 * @deprecated [carpool_v2_migration]
 *
 * @param acquisition_status CarpoolAcquisitionStatusEnum
 * @param fraud_status CarpoolFraudStatusEnum
 * @returns CarpoolV1StatusEnum
 */
export function carpoolV2ToV1StatusConverter(
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

// CHECK THESE FILES TOO!
// api/src/pdc/services/acquisition/helpers/castStatus.ts
// api/src/pdc/services/carpool/helpers/getStatus.ts
