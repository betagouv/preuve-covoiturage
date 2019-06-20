export interface UserBaseInterface {
  _id?: string;
  email?: string;
  lastname?: string;
  firstname?: string;
  group?: string;
  permissions?: string[];
  phone?: string;
  password?: string;
  role?: string;
  status?: string;
  forgottenReset?: string;
  forgottenToken?: string;
  emailConfirm?: string;
  emailToken?: string;
  operator?: string;
  territory?: string;
  hasResetPassword?: boolean;
  forgottenAt?: Date;
  emailChangeAt?: Date;
  lastConnectedAt?: Date;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
