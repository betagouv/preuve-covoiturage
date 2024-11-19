export interface UserListInterface {
  _id: number;
  email: string;
  firstname: string;
  lastname: string;
  group: string;
  role: string;
  status: string;
  operator_id: number | null;
  territory_id: number | null;
}
