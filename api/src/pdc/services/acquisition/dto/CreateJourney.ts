import {
  array,
  boolean,
  defaulted,
  enums,
  Infer,
  integer,
  object,
  optional,
  size,
  unknown,
} from "@/lib/superstruct/index.ts";

import {
  Amount,
  Distance,
  Email,
  ExternalId,
  IdentityKey,
  Incentive,
  OperatorClass,
  Phone,
  Serial,
  Siret,
  TimeGeoPoint,
  Varchar,
} from "./shared.ts";

export const Identity = object({
  identity_key: IdentityKey,
  operator_user_id: ExternalId,
  firstname: optional(Varchar),
  lastanme: optional(Varchar),
  email: optional(Email),
  phone: optional(Phone),
  phone_trunc: optional(Phone),
  company: optional(Varchar),
  over_18: optional(boolean()),
  travel_pass: optional(object({
    name: enums(["navigo"]),
    user_id: ExternalId,
  })),
});

const Driver = object({
  identity: Identity,
  revenue: Amount,
});

const Payment = object({
  amount: Amount,
  type: Varchar,
  index: size(integer(), 0, 19),
  siret: Siret,
});

const Passenger = object({
  identity: Identity,
  contribution: Amount,
  payments: optional(size(array(Payment), 0, 20)),
  seats: size(defaulted(integer(), 1), 1, 8),
});

export const CreateJourney = object({
  operator_id: Serial,
  operator_journey_id: ExternalId,
  operator_trip_id: ExternalId,
  operator_class: OperatorClass,
  start: TimeGeoPoint,
  end: TimeGeoPoint,
  driver: Driver,
  passenger: Passenger,
  distance: Distance,
  licence_plate: optional(Varchar),
  incentives: size(array(Incentive), 0, 20),
  incentive_counterparts: optional(unknown()),
});

export type CreateJourney = Infer<typeof CreateJourney>;
