import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";

import { EtalabAPIGeoProvider } from "../providers/index.ts";
import { NotFoundException } from "@/ilos/common/index.ts";
import { insee, inseeError, inseeGeo, inseeGeoError } from "./data.ts";

const provider = new EtalabAPIGeoProvider();

it("EtalabAPIGeoProvider: positionToInsee", async (t) => {
  assertEquals(await provider.positionToInsee(insee.position), insee.code);
});

it("EtalabAPIGeoProvider: positionToInsee not found", async (t) => {
  await assertThrows(provider.positionToInsee(inseeError.position), {
    instanceOf: NotFoundException,
  });
});

it("EtalabAPIGeoProvider: inseeToPosition", async (t) => {
  const { lat, lon } = await provider.inseeToPosition(inseeGeo.code);
  assertEquals(lon, inseeGeo.position.lon);
  assertEquals(lat, inseeGeo.position.lat);
});

it("EtalabAPIGeoProvider: inseeToPosition error", async (t) => {
  await assertThrows(provider.inseeToPosition(inseeGeoError.code), {
    instanceOf: NotFoundException,
  });
});
