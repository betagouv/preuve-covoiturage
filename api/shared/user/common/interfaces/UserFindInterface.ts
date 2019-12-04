export interface UserFindInterface {
  email: string;
  firstname: string;
  lastname: string;
  phone: string;
  group: string;
  role: string;
  operator_id?: number;
  territory_id?: number;
  permissions: string[];
  status: string;

  _id: number;
  created_at: Date;
  updated_at: Date;
}
