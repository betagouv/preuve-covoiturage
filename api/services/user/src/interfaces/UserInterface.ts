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
  _id: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserFindInterface extends UserFullInterface {
  permissions: string[];
  ui_status?: { [k: string]: any };
}

export interface UserListInterface extends UserFullInterface {}

export interface UserPatchInterface extends Partial<UserFullInterface> {}

export interface UserListFiltersInterface {
  territory_id?: string;
  operator_id?: string;
}
