export interface UserBaseInterface {
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  group?: string; // computed prop
  role: string;
  operator_id?: string;
  territory_id?: string;
}
