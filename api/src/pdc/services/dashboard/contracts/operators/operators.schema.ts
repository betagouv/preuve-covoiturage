export const alias = "dashboard.operators";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: {
    id: {
      type: "integer",
    },
  },
};

export const binding = [alias, schema];
