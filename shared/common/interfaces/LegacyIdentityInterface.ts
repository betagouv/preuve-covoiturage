export interface LegacyIdentityInterface {
  phone?: string;
  phone_trunc?: string;
  operator_user_id?: string;

  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;

  travel_pass: {
    name: string;
    user_id: string;
  };

  over_18?: boolean | null;
}
