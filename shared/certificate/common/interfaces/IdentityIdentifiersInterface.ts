export type IdentityIdentifiersInterface =
  | { _id: number }
  | { phone: string }
  | { phone_trunc: string; operator_user_id: string }
  | { operator_user_id: string };
