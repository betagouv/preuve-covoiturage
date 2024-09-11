export type Lat = number;
export type Lon = number;
export type Id = number;
export type Uuid = string;

export type Position = {
  lat: Lat;
  lon: Lon;
};

export type Distance = number;
export type LicencePlate = string;
export type Financial = number;
export type Seat = number;
export type Phone = string;
export type Name = string;
export type Siret = string;
export type GeoCode = string;
export type SerializableError = Error;

export enum OperatorClass {
  A = "A",
  B = "B",
  C = "C",
}

export type CarpoolIncentive = {
  index: number;
  siret: Siret;
  amount: Financial;
};

export enum IncentiveCounterpartTarget {
  Driver = "driver",
  Passenger = "passenger",
}

export type CarpoolIncentiveCounterpart = {
  target: IncentiveCounterpartTarget;
  siret: Siret;
  amount: Financial;
};

export type Payment = {
  index: number;
  amount: Financial;
  siret: Siret;
  type: Name;
};

export type Payload = unknown;
export type ApiVersion = number;
export type CancelCode = string;
export type CancelMessage = string;

export enum CarpoolStatusEnum {
  AcquisitionError = "acquisition_error",
  ValidationError = "validation_error",
  NormalizationError = "normalization_error",
  FraudError = "fraud_error",
  AnomalyError = "anomaly_error",
  Ok = "ok",
  Expired = "expired",
  Canceled = "canceled",
  Pending = "pending",
  Unknown = "unknown",
}

export enum CarpoolAcquisitionStatusEnum {
  Received = "received",
  Updated = "updated",
  Processed = "processed",
  Failed = "failed",
  Canceled = "canceled",
  Expired = "expired",
}

export enum CarpoolFraudStatusEnum {
  Pending = "pending",
  Passed = "passed",
  Failed = "failed",
}

export enum CarpoolAnomalyStatusEnum {
  Pending = "pending",
  Passed = "passed",
  Failed = "failed",
}
