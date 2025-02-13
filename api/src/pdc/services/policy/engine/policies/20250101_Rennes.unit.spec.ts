import { it } from "@/dev_deps.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { makeProcessHelper } from "@/pdc/services/policy/engine/tests/macro.ts";
import { CarpoolInterface, OperatorsEnum, TerritoryCodeInterface } from "@/pdc/services/policy/interfaces/index.ts";
import { Rennes2025 as Handler } from "./20250101_Rennes.ts";

const defaultPosition: TerritoryCodeInterface = {
  arr: "74206",
  com: "74206",
  aom: "200067551",
  epci: "200067551",
  dep: "74",
  reg: "84",
  country: "XXXXX",
};

const startIn = {
  lat: 48.1148,
  lon: -1.6792,
};

const endIn = {
  lat: 48.1257,
  lon: -1.6588,
};

const defaultLat = 46.313355215729146;
const defaultLon = 6.487631441991693;

const defaultCarpool: CarpoolInterface & { _id: number; duration: number } = {
  _id: 1,
  operator_trip_id: uuidV4(),
  passenger_identity_key: uuidV4(),
  driver_identity_key: uuidV4(),
  operator_uuid: OperatorsEnum.BLABLACAR_DAILY,
  operator_class: "C",
  passenger_is_over_18: true,
  passenger_has_travel_pass: true,
  driver_has_travel_pass: true,
  datetime: new Date("2025-04-15"),
  seats: 1,
  duration: 600,
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

it("should work with exclusions", async () =>
  await process(
    {
      policy: { handler: Handler.id },
      carpool: [
        { operator_uuid: "not in list" },
        { distance: 4_500 },
        { operator_class: "A" },
        { distance: 60_001 },
        { start_lat: startIn.lat, start_lon: startIn.lon, end_lat: endIn.lat, end_lon: endIn.lon },
      ],
      meta: [],
    },
    { incentive: [0, 0, 0, 0, 0], meta: [] },
  ));

it("should work before first of july ", async () =>
  await process(
    {
      policy: { handler: Handler.id },
      carpool: [
        { distance: 5_000 },
        { distance: 5_000, seats: 2 },
        {
          distance: 59_000,
        },
      ],
    },
    {
      incentive: [50, 100, 50],
    },
  ));

it("should work after first of july ", async () =>
  await process(
    {
      policy: { handler: Handler.id },
      carpool: [
        { distance: 5_000, datetime: new Date("2025-07-01") },
        { distance: 5_000, seats: 2, datetime: new Date("2025-07-01") },
        {
          distance: 16_000,
          datetime: new Date("2025-07-01"),
        },
        {
          distance: 30_000,
          datetime: new Date("2025-07-01"),
        },
        {
          distance: 40_000,
          datetime: new Date("2025-07-01"),
        },
        { distance: 59_000, seats: 2, datetime: new Date("2025-07-01") },
      ],
    },
    {
      incentive: [100, 200, 110, 250, 250, 500],
    },
  ));

it("should work with driver month limits", async () =>
  await process(
    {
      policy: { handler: Handler.id },
      carpool: [
        { distance: 5_000, driver_identity_key: "one" },
        { distance: 5_000, driver_identity_key: "one" },
      ],
      meta: [
        {
          key: "max_amount_restriction.0-one.month.3-2025",
          value: 149_50,
        },
      ],
    },
    {
      incentive: [50, 0],
      meta: [
        {
          key: "max_amount_restriction.0-one.month.3-2025",
          value: 150_00,
        },
        {
          key: "max_amount_restriction.global.campaign.global",
          value: 50,
        },
      ],
    },
  ));
