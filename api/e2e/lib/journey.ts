import { set } from "@/lib/object/index.ts";
import { array } from "@/lib/superstruct/index.ts";
import { create, defaulted, enums, Infer, number, object, optional, string } from "dep:superstruct";
import { faker, opt } from "../lib/faker.ts";

const Incentive = object({
  index: defaulted(number(), () => faker.number.int({ min: 0, max: 2 })),
  amount: defaulted(number(), () => faker.number.int({ min: 0, max: 10_00 })),
  siret: defaulted(string(), () => faker.extra.siret()),
});

const Payment = object({
  index: defaulted(number(), () => faker.number.int({ min: 0, max: 2 })),
  amount: defaulted(number(), () => faker.number.int({ min: 0, max: 10_00 })),
  siret: defaulted(string(), () => faker.extra.siret()),
  type: defaulted(string(), () => faker.commerce.productName()),
});

const TravelPass = object({
  name: defaulted(string(), () => faker.helpers.arrayElement(["navigo"])),
  user_id: defaulted(string(), () => faker.string.uuid()),
});

const TimestampedLocation = object({
  datetime: defaulted(string(), () => faker.date.recent().toISOString()),
  lat: defaulted(number(), () => faker.location.latitude()),
  lon: defaulted(number(), () => faker.location.longitude()),
});

const Identity = object({
  identity_key: defaulted(string(), () => faker.string.uuid()),
  phone: optional(string()),
  phone_trunc: defaulted(string(), () => faker.phone.number({ style: "international" }).slice(0, 10)),
  // application_timestamp: optional(defaulted(string(), () => opt(faker.date.recent().toISOString()))),
  operator_user_id: defaulted(string(), () => faker.string.uuid()),
  travel_pass: optional(defaulted(TravelPass, () => opt({}))),
});

const Driver = object({
  identity: defaulted(Identity, () => ({})),
  revenue: defaulted(number(), () => faker.number.int({ min: 0, max: 10_00 })),
});

const Passenger = object({
  identity: defaulted(Identity, () => ({})),
  payments: defaulted(array(Payment), () => []),
  contribution: defaulted(number(), () => faker.number.int({ min: 0, max: 10_00 })),
  seats: defaulted(number(), () => faker.number.int({ min: 1, max: 4 })),
});

const Journey = object({
  operator_journey_id: defaulted(string(), () => faker.string.uuid()),
  operator_trip_id: defaulted(string(), () => faker.string.uuid()),
  operator_class: defaulted(enums(["A", "B", "C"]), () => faker.helpers.arrayElement(["A", "B", "C"])),
  incentives: defaulted(
    array(Incentive),
    () => Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, (...args) => ({ index: args[1] })),
  ),
  licence_plate: optional(defaulted(string(), () => opt(faker.extra.immatriculation()))),
  start: defaulted(TimestampedLocation, () => ({})),
  end: defaulted(TimestampedLocation, () => ({})),
  distance: defaulted(number(), () => faker.number.int({ min: 0, max: 100_000 })),
  driver: defaulted(Driver, () => ({})),
  passenger: defaulted(Passenger, () => ({})),
});

// Infer the TypeScript type from the schema
export type JourneyType = Infer<typeof Journey>;

async function identityFactory(override: Partial<Infer<typeof Identity>> = {}): Promise<Infer<typeof Identity>> {
  const phone = override.phone ?? faker.phone.number({ style: "international" });
  const identity_key = await faker.extra.identity_key(faker.person.fullName(), override.phone);
  set(override, "identity_key", identity_key);
  set(override, "phone_trunc", phone?.slice(0, 10));

  return create(override, Identity);
}

export const factory = async (override: Partial<JourneyType> = {}): Promise<JourneyType> => {
  // Start and end times
  const start_datetime = new Date(override.start?.datetime ?? new Date().getTime() - 3600000);
  const duration = faker.number.int({ min: 1, max: 60 }) * 60 * 1000;
  const end_datetime = new Date(start_datetime.getTime() + duration);
  set(override, "start.datetime", start_datetime.toISOString());
  set(override, "end.datetime", end_datetime.toISOString());

  set(override, "driver.identity", await identityFactory(override.driver?.identity));
  set(override, "passenger.identity", await identityFactory(override.passenger?.identity));

  return create(override, Journey);
};

export const createOperatorJourney = async function (override: Partial<JourneyType> = {}): Promise<JourneyType> {
  return factory(override);
};
