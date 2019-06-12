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
  emailConfirm?: string;
  emailToken?: string;
  operator?: string;
  aom?: string;
  hasResetPassword?: boolean;
  forgottenAt?: Date;
  emailChangeAt?: Date;
  lastConnectedAt?: Date;
}

export interface UserDbInterface extends UserBaseInterface {
  _id?: string;
  fullname: string;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

