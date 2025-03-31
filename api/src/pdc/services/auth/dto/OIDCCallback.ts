import { Infer, object, string } from "@/lib/superstruct/index.ts";

export const OIDCCallback = object({
  code: string(),
});

export type OIDCCallback = Infer<typeof OIDCCallback>;
