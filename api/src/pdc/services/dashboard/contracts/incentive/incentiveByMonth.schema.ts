import { directionTypes } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export const alias = "dashboard.incentivebyMonth";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: ["territory_id"],
  properties: {
    territory_id: {
      type: "integer",
    },
    year: {
      type: "integer",
      minimum: 2020,
    },
    direction: {
      type: "string",
      enum: directionTypes,
    },
  },
};

export const binding = [alias, schema];
