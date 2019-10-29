export interface UserBaseInterface {
  email: string;
  firstname: string;
  lastname: string;
  roles: string[];
  phone?: string;
}

export interface UserCreateInterface extends UserBaseInterface {
  operator_id?: string;
  territory_id?: string;
  password: string;
}

export interface UserFullInterface extends UserCreateInterface {
  status: string;
  forgotten_token?: string;
  forgotten_at?: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  ui_status?: { [k: string]: any };
}

export interface UserDbInterface extends UserFullInterface {
  _id: string;
}

export interface UserPatchInterface extends Partial<UserFullInterface> {}
