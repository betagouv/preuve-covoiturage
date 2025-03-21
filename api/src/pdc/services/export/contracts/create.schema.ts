import { territoryCodeSchema } from "@/pdc/services/territory/contracts/common/schema.ts";

export const schemaV2 = {
  type: "object",
  additionalProperties: false,
  required: ["date"],
  properties: {
    tz: {
      macro: "tz",
    },
    date: {
      type: "object",
      additionalProperties: false,
      required: ["start", "end"],
      properties: {
        start: {
          macro: "timestamp",
        },
        end: {
          macro: "timestamp",
        },
      },
    },
    operator_id: {
      oneOf: [
        {
          type: "array",
          minItems: 1,
          items: { macro: "serial" },
        },
        {
          macro: "serial",
        },
      ],
    },
    geo_selector: territoryCodeSchema,
  },
};

export const schemaV3 = {
  type: "object",
  additionalProperties: false,
  required: ["tz", "start_at", "end_at"],
  properties: {
    tz: {
      macro: "tz",
    },
    start_at: {
      macro: "timestamp",
    },
    end_at: {
      macro: "timestamp",
    },
    created_by: {
      macro: "serial",
    },
    operator_id: {
      type: "array",
      minItems: 0,
      maxItems: 128,
      items: { macro: "serial" },
    },
    territory_id: {
      type: "array",
      minItems: 0,
      maxItems: 1024,
      items: { macro: "serial" },
    },
    recipients: {
      type: "array",
      minItems: 0,
      maxItems: 24,
      items: { macro: "varchar" },
    },
    geo_selector: territoryCodeSchema,
  },
};

export const aliasV2 = "export.create.v2";
export const aliasV3 = "export.create.v3";
export const bindingV2 = [aliasV2, schemaV2];
export const bindingV3 = [aliasV3, schemaV3];
