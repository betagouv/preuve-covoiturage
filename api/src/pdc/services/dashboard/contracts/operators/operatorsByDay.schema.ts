import { directionTypes } from "@/pdc/services/geo/contracts/shared/Perimeter.ts";

export const alias = "dashboard.operatorsbyDay";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: ["territory_id"],
  properties: {
    territory_id: {
      type: "integer",
    },
    date: {
      type: "string",
    },
    direction: {
      type: "string",
      enum: directionTypes,
    },
  },
};

export const binding = [alias, schema];
