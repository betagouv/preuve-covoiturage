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
  forgotten_at?: Date;
  forgotten_token?: string;
  operator?: string;
  territory?: string;
  last_connected_at?: Date;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}
