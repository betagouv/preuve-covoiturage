import { CarpoolStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";

export interface ParamsInterface {
  operator_journey_id: string;
  operator_id: number;
  api_version: "v3" | "v3.1";
}

export interface AnomalyErrorDetails {
  label: "temporal_overlap_anomaly";
  metas: {
    conflicting_journey_id: string;
    temporal_overlap_duration_ratio: number;
  };
}

export interface ResultInterface {
  operator_journey_id: string;
  status: CarpoolStatusEnum;
  created_at: Date;
  fraud_error_labels?: string[];
  anomaly_error_details?: AnomalyErrorDetails[];
  terms_violation_details?: string[];
  journey_id?: number;
}

export const handlerConfig = {
  service: "acquisition",
  method: "status",
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
