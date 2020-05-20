export interface IdentityInterface {
  _id?: number;
  uuid?: string;

  phone?: string;
  phone_trunc?: string;
  operator_user_id?: string;

  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;

  travel_pass_name?: string;
  travel_pass_user_id?: string;

  over_18?: boolean | null;
}
