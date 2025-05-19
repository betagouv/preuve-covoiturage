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

export type AccessToken = {
  token_id?: string,
  operator_id: number,
  role: string,
}

export const CrudAccessTokenParams = object({
  operator_id: string(),
})

export const DeleteAccessTokenBody = object({
  operator_id: string(),
  token_id: string()
})

export type DeleteAccessTokenBody = Infer<typeof DeleteAccessTokenBody>;