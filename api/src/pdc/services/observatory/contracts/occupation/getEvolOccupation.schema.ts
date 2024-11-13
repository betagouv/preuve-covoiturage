import { indicTypes, perimeterTypes } from "../../../../../shared/geo/shared/Perimeter.ts";

export const alias = "observatory.getEvolOccupation";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: ["year", "type", "code", "indic"],
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
    code: {
      anyOf: [
        { macro: "insee" },
        { macro: "department" },
        { macro: "country" },
        { macro: "siren" },
      ],
    },
    indic: {
      type: "string",
      enum: indicTypes,
    },
    past: {
      type: "string",
      minLength: 1,
      maxLength: 2,
      default: "2",
    },
  },
};

export const binding = [alias, schema];
