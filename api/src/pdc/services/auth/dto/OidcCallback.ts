import { Infer, object, string } from "@/lib/superstruct/index.ts";

export const OidcCallback = object({
  code: string(),
});

export type OidcCallback = Infer<typeof OidcCallback>;
