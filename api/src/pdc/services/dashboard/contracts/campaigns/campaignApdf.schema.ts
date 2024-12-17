export const alias = "dashboard.campaignApdf";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: [],
  properties: {
    campaign_id: {
      type: "integer",
    },
  },
};

export const binding = [alias, schema];
