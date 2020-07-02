export type IdentityIdentifiersInterface =
  | { _id: number }
  | { uuid: string }
  | { phone: string }
  | { phone_trunc: string; operator_user_id: string };
