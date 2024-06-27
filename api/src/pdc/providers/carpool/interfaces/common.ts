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

/**
 * @deprecated [carpool_v2_migration]
 *
 * Carpool_v2 uses multiple statuses (acquisition_status, fraud_status)
 * to determine the status of a carpool.
 *
 * Use the statusConverter() function to convert these statuses to a single status.
 */
export enum CarpoolV1StatusEnum {
  Ok = "ok",
  Expired = "expired",
  Canceled = "canceled",
  FraudcheckError = "fraudcheck_error",
  AnomalyError = "anomaly_error",
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
