import { perimeterTypes } from "../../../../../shared/geo/shared/Perimeter.ts";

export const alias = "observatory.getBestTerritories";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: ["year", "type", "observe", "code"],
  properties: {
    year: {
      type: "integer",
      minimum: 2020,
    },
    month: {
      type: "integer",
      minimum: 1,
      maximum: 12,
    },
    trimester: {
      type: "integer",
      minimum: 1,
      maximum: 4,
    },
    semester: {
      type: "integer",
      minimum: 1,
      maximum: 2,
    },
    type: {
      type: "string",
      enum: perimeterTypes,
    },
    observe: {
      type: "string",
      enum: perimeterTypes,
    },
    code: {
      anyOf: [
        { macro: "insee" },
        { macro: "department" },
        { macro: "country" },
        { macro: "siren" },
      ],
    },
    limit: {
      type: "integer",
      minimum: 5,
      maximum: 100,
      default: 10,
    },
  },
};

export const binding = [alias, schema];
