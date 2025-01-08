export const alias = "dashboard.users";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: {
    id: {
      type: "integer",
    },
    operator_id: {
      type: "integer",
    },
    territory_id: {
      type: "integer",
    },
  },
};

export const binding = [alias, schema];
