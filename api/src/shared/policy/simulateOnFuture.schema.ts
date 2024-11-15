import {
  driverSchema,
  passengerSchema,
  timeGeoPointSchema,
} from "../acquisition/common/schemas/createJourneySchemaV3.ts";

export const aliasv3 = "policy.simulateOnFuture.v3";
export const schemav3 = {
  $id: aliasv3,
  type: "object",
  required: ["operator_id", "operator_class", "start", "end", "passenger", "driver"],
  additionalProperties: false,
  properties: {
    operator_id: { macro: "serial" },
    operator_class: { enum: ["A", "B", "C"] },
    start: timeGeoPointSchema,
    end: timeGeoPointSchema,
    passenger: passengerSchema,
    driver: driverSchema,
  },
};

export const alias = "policy.simulateOnFuture";
export const schema = schemav3;
export const binding = [alias, schema];
