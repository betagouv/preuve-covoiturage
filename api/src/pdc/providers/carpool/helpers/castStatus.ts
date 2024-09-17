import { CarpoolAnomalyStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { CarpoolStatus } from "../interfaces/database/label.ts";
import {
  CarpoolAcquisitionStatusEnum,
  CarpoolFraudStatusEnum,
  CarpoolStatusEnum,
} from "../interfaces/index.ts";

export function castToStatusEnum(
  data: Partial<CarpoolStatus>,
): CarpoolStatusEnum {
  if (!data.acquisition_status) {
    return CarpoolStatusEnum.Unknown;
  }
  if (data.acquisition_status === CarpoolAcquisitionStatusEnum.Canceled) {
    return CarpoolStatusEnum.Canceled;
  }
  if (data.acquisition_status === CarpoolAcquisitionStatusEnum.Expired) {
    return CarpoolStatusEnum.Expired;
  }
  if (data.acquisition_status === CarpoolAcquisitionStatusEnum.Failed) {
    return CarpoolStatusEnum.AcquisitionError;
  }
  if (
    data.acquisition_status === CarpoolAcquisitionStatusEnum.Processed &&
    data.anomaly_status === CarpoolAnomalyStatusEnum.Passed &&
    data.fraud_status === CarpoolFraudStatusEnum.Passed
  ) {
    return CarpoolStatusEnum.Ok;
  }

  if (data.fraud_status === CarpoolFraudStatusEnum.Failed) {
    return CarpoolStatusEnum.FraudError;
  }
  if (data.anomaly_status === CarpoolAnomalyStatusEnum.Failed) {
    return CarpoolStatusEnum.AnomalyError;
  }

  return CarpoolStatusEnum.Pending;
}

export function castFromStatusEnum(
  status: CarpoolStatusEnum,
): Array<Partial<CarpoolStatus>> {
  switch (status) {
    case CarpoolStatusEnum.AcquisitionError:
    case CarpoolStatusEnum.ValidationError:
    case CarpoolStatusEnum.NormalizationError:
      return [{
        acquisition_status: CarpoolAcquisitionStatusEnum.Failed,
      }];
    case CarpoolStatusEnum.FraudError:
      return [{
        fraud_status: CarpoolFraudStatusEnum.Failed,
      }];
    case CarpoolStatusEnum.AnomalyError:
      return [{
        anomaly_status: CarpoolAnomalyStatusEnum.Failed,
      }];
    case CarpoolStatusEnum.Ok:
      return [{
        acquisition_status: CarpoolAcquisitionStatusEnum.Processed,
        anomaly_status: CarpoolAnomalyStatusEnum.Passed,
        fraud_status: CarpoolFraudStatusEnum.Passed,
      }];
    case CarpoolStatusEnum.Expired:
      return [{
        acquisition_status: CarpoolAcquisitionStatusEnum.Expired,
      }];
    case CarpoolStatusEnum.Canceled:
      return [{
        acquisition_status: CarpoolAcquisitionStatusEnum.Canceled,
      }];
    case CarpoolStatusEnum.Pending:
      return [{
        acquisition_status: CarpoolAcquisitionStatusEnum.Received,
      }, {
        acquisition_status: CarpoolAcquisitionStatusEnum.Updated,
      }, {
        fraud_status: CarpoolFraudStatusEnum.Pending,
      }, {
        anomaly_status: CarpoolAnomalyStatusEnum.Pending,
      }];
    case CarpoolStatusEnum.Unknown:
      return [];
  }
}
