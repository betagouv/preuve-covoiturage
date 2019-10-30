export interface UserBaseInterface {
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  group: string; // computed prop
  phone?: string;
  operator_id?: string;
  territory_id?: string;
}

export interface UserFullInterface extends UserBaseInterface {
  ui_status?: { [k: string]: any };
}

export interface UserDbInterface extends UserFullInterface {
  created_at: Date;
  updated_at: Date;
}

export interface UserFindInterface extends UserDbInterface {
  _id: string;
  permissions: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserListInterface extends UserDbInterface {
  _id: string;
  status: string;
}

export interface UserPatchInterface extends Partial<UserFullInterface> {}

export interface UserListFiltersInterface {
  territory_id?: string;
  operator_id?: string;
}
