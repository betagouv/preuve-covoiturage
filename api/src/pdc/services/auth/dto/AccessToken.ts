import { Infer, object, string } from "@/lib/superstruct/index.ts";

export const AccessTokenParams = object({
  access_key: string(),
  secret_key: string(),
});

export type AccessTokenParams = Infer<typeof AccessTokenParams>;

export const AccessTokenResult = object({
  access_token: string(),
});
export type AccessTokenResult = Infer<typeof AccessTokenResult>;
