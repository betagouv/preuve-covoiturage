export interface UserPatchInterface {
  email?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  forgotten_token?: string;
  forgotten_at?: Date;
  status?: string;
  role?: string;
}
