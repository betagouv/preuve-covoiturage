export interface IdentityInterface {
  phone: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  company?: string;
  travel_pass?: {
    name: string;
    user_id: string;
  };
  over_18?: boolean | null;
}
