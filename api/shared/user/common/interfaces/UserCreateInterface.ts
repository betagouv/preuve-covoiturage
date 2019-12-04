export interface UserCreateInterface {
  email: string;
  firstname: string;
  lastname: string;
  phone?: string;
  group?: string; // computed prop
  role: string;
  operator_id?: number;
  territory_id?: number;
}
