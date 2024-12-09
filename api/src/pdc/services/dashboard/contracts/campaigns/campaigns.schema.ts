export const alias = "dashboard.campaigns";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: {
    territory_id: {
      type: "integer",
    },
  },
};

export const binding = [alias, schema];
