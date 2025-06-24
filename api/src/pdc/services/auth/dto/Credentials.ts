import { array, enums, Infer, object, optional, string } from "@/lib/superstruct/index.ts";
import { Id } from "@/pdc/providers/superstruct/shared/index.ts";
/**
 * Definitions:
 *
 * -  `access_key`: The access key for the application.
 * -  `secret_key`: The secret key for the application.
 * -  `access_token`: The token returned after successful authentication with the access key and secret key.
 * -  `operator_id`: The ID of the operator associated with the access token.
 * -  `token_id`: The unique identifier for the access token used for retrieval.
 * -  `role`: The role associated with the access token, typically "application".
 */

export const CredentialsPair = object({
  access_key: string(),
  secret_key: string(),
});
export type CredentialsPair = Infer<typeof CredentialsPair>;

export const CredentialsRole = enums(["application"]);
export type CredentialsRole = Infer<typeof CredentialsRole>;

export const Credentials = object({
  token_id: optional(string()),
  operator_id: Id,
  role: CredentialsRole,
});
export type Credentials = Infer<typeof Credentials>;

// CRUD: DexClient
export type DexClientReadResult = Array<Credentials>;
export type DexClientCreateResult = CredentialsPair;
export type DexClientDeleteResult = void;

/**
 * CRUD: Credentials
 */

// Create
export const CreateCredentialsParams = object({
  operator_id: Id,
});
export type CreateCredentialsParams = Infer<typeof CreateCredentialsParams>;

export const CreateCredentialsResult = CredentialsPair;
export type CreateCredentialsResult = Infer<typeof CreateCredentialsResult>;

// Read
export const ReadCredentialsParams = object({
  operator_id: Id,
});
export type ReadCredentialsParams = Infer<typeof ReadCredentialsParams>;

export const ReadCredentialsResult = array(Credentials);
export type ReadCredentialsResult = Infer<typeof ReadCredentialsResult>;

//  Delete
export const DeleteCredentialsParams = object({
  operator_id: Id,
  token_id: string(),
});
export type DeleteCredentialsParams = Infer<typeof DeleteCredentialsParams>;
export type DeleteCredentialsResult = void;

// Create Access Token
export const CreateAccessTokenParams = CredentialsPair;
export type CreateAccessTokenParams = Infer<typeof CreateAccessTokenParams>;

export const CreateAccessTokenResult = object({
  access_token: string(),
});
export type CreateAccessTokenResult = Infer<typeof CreateAccessTokenResult>;
