import { ceeApplicationUuidSchema } from "@/shared/cee/common/ceeSchema.ts";

export const alias = "cee.findCeeApplication";
export const schema = {
  type: "object",
  additionalProperties: false,
  required: ["uuid"],
  properties: {
    uuid: ceeApplicationUuidSchema,
  },
};
export const binding = [alias, schema];