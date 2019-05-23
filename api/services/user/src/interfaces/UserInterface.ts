export interface UserInterface {
  _id?: string;
  email: string;
  lastname: string;
  firstname: string;
  fullname: string;
  phone: string;
  group: string;
  role: string;
  permissions: string;
  password: string;
  status: string;
  forgottenReset: string;
  forgottenToken: string;
  operator?: string;
  aom?: string;
  hasResetPassword: boolean;
  forgottenAt: Date;
  lastConnectedAt: Date;
  options: object;
  deletedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
