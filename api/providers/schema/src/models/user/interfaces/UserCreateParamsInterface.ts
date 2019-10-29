export interface UserCreateParamsInterface {
  email: string;
  lastname: string;
  firstname: string;
  phone: string;
  group: string;
  role: string;
  territory?: string;
  operator?: string;
}
