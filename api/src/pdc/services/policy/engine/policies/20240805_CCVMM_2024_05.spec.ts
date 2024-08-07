import { it } from "@/dev_deps.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { OperatorsEnum } from "../../interfaces/index.ts";
import { makeProcessHelper } from "../tests/macro.ts";
import { CCVMM202405 as Handler } from "./20240805_CCVMM_2024_05.ts";

// Toul
const defaultPosition = {
  arr: "54528",
  com: "54528",
  aom: "200070563",
  epci: "200066645",
  dep: "54",
  reg: "44",
  country: "XXXXX",
};
const defaultLat = 48.67590006663716;
const defaultLon = 5.890172847442269;

const defaultCarpool = {
  _id: 1,
  operator_trip_id: uuidV4(),
  passenger_identity_key: uuidV4(),
  driver_identity_key: uuidV4(),
  operator_uuid: OperatorsEnum.BLABLACAR_DAILY,
  operator_class: "C",
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date("2024-05-15"),
  seats: 1,
  distance: 5_000,
  operator_journey_id: uuidV4(),
  operator_id: 1,
  driver_revenue: 20,
  passenger_contribution: 20,
  start: { ...defaultPosition },
  end: { ...defaultPosition },
  start_lat: defaultLat,
  start_lon: defaultLon,
  end_lat: defaultLat,
  end_lon: defaultLon,
};

const process = makeProcessHelper(defaultCarpool);

it(
  "should work with exclusions",
  async () =>
    await process(
      {
        policy: { handler: Handler.id },
        carpool: [
          { distance: 1_999 },
          { distance: 80_001 },
          { operator_class: "A" },
          { operator_uuid: OperatorsEnum.KAROS },

          // // OD hors AOM
          {
            start: { ...defaultPosition, epci: "244900015" },
            end: { ...defaultPosition, epci: "244900015" },
          },

          { passenger_is_over_18: false },
        ],
        meta: [],
      },
      { incentive: [0, 0, 0, 0, 0, 0], meta: [] },
    ),
);

it(
  "should work basic",
  async () =>
    await process(
      {
        policy: { handler: Handler.id },
        carpool: [
          {
            distance: 1_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
          },
          {
            distance: 5_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
          },
          {
            distance: 5_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
            seats: 2,
          },
          {
            distance: 20_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
          },
          {
            distance: 40_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
            seats: 2,
          },
          {
            distance: 80_000,
            driver_identity_key: uuidV4(),
            passenger_identity_key: uuidV4(),
          },
        ],
        meta: [],
      },
      {
        incentive: [0, 150, 300, 200, 600, 0],
      },
    ),
);

it(
  "should work with global limits",
  async () =>
    await process(
      {
        policy: { handler: Handler.id, max_amount: 2_200_000_00 },
        carpool: [{ distance: 5_000, driver_identity_key: "one" }],
        meta: [
          {
            key: "max_amount_restriction.global.campaign.global",
            value: 2_199_999_00,
          },
        ],
      },
      {
        incentive: [100],
        meta: [
          {
            key: "max_amount_restriction.global.campaign.global",
            value: 2_200_000_00,
          },
          {
            key: "max_amount_restriction.0-one.month.4-2024",
            value: 150,
          },
        ],
      },
    ),
);

it(
  "should work with day limits",
  async () =>
    await process(
      {
        policy: { handler: Handler.id },
        carpool: [
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
          { distance: 5_000, driver_identity_key: "driver_A" },
        ],
        meta: [],
      },
      {
        incentive: [150, 150, 150, 150, 150, 150, 0],
        meta: [
          {
            key: "max_amount_restriction.global.campaign.global",
            value: 900,
          },
          {
            key: "max_amount_restriction.0-driver_A.month.4-2024",
            value: 900,
          },
        ],
      },
    ),
);

it(
  "should work with driver month budget limits",
  async () =>
    await process(
      {
        policy: { handler: Handler.id },
        carpool: [
          { distance: 6_000, driver_identity_key: "one" },
          { distance: 6_000, driver_identity_key: "one" },
        ],
        meta: [
          {
            key: "max_amount_restriction.global.campaign.global",
            value: 100_00,
          },
          {
            key: "max_amount_restriction.0-one.month.4-2024",
            value: 119_00,
          },
        ],
      },
      {
        incentive: [100, 0],
        meta: [
          {
            key: "max_amount_restriction.global.campaign.global",
            value: 101_00,
          },
          {
            key: "max_amount_restriction.0-one.month.4-2024",
            value: 120_00,
          },
        ],
      },
    ),
);
