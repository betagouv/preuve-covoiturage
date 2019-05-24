export interface UserBaseInterface {
  email?: string;
  lastname?: string;
  firstname?: string;
  group?: string;
  permissions?: string[];
  phone?: string;
  password?: string;
  fullname?: string;
  role?: string;
  status?: string;
  forgottenReset?: string;
  forgottenToken?: string;
  operator?: string;
  aom?: string;
  hasResetPassword?: boolean;
  forgottenAt?: Date;
  lastConnectedAt?: Date;
  options?: object;

}


export interface UserDbInterface extends UserBaseInterface {
  _id?: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
