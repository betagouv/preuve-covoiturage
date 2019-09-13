export interface UserInterface {
  _id?: string;
  email: string;
  lastname: string;
  firstname: string;
  group: string;
  permissions: string[];
  password?: string;
  role?: string;
  phone?: string;
  status?: string;
  forgotten_reset?: string;
  forgotten_token?: string;
  email_confirm?: string;
  email_token?: string;
  operator?: string;
  territory?: string;
  has_reset_password?: boolean;
  forgotten_at?: Date;
  email_change_at?: Date;
  last_connected_at?: Date;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
