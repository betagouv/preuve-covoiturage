import {
  CarpoolAcquisitionStatusEnum,
  CarpoolAnomalyStatusEnum,
  CarpoolFraudStatusEnum,
} from "../common.ts";

export interface CarpoolLabel<P = unknown> {
  label: string;
  meta?: P;
}

export interface CarpoolStatus {
  acquisition_status: CarpoolAcquisitionStatusEnum;
  anomaly_status: CarpoolAnomalyStatusEnum;
  fraud_status: CarpoolFraudStatusEnum;
}
