export class User {
  public _id?: string;
  public email: string;
  public lastname: string;
  public firstname: string;
  public group: string;
  public permissions: string[];
  public phone: string;
  public password?: string;
  public role?: string;
  public status?: string;
  public forgottenReset?: string;
  public forgottenToken?: string;
  public emailConfirm?: string;
  public emailToken?: string;
  public operator?: string;
  public territory?: string;
  public hasResetPassword?: boolean;
  public forgottenAt?: Date;
  public emailChangeAt?: Date;
  public lastConnectedAt?: Date;
  public deletedAt?: Date;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(data: {
    _id?: string;
    email: string;
    lastname: string;
    firstname: string;
    group: string;
    permissions: string[];
    password?: string;
    role?: string;
    phone?: string;
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
  }) {
    this._id = data._id;
    this.email = data.email;
    this.lastname = data.lastname;
    this.firstname = data.firstname;
    this.phone = data.phone;
    this.group = data.group;
    this.role = data.role;
    this.permissions = data.permissions;
    this.password = data.password;
    this.status = data.status;
    this.forgottenReset = data.forgottenReset;
    this.forgottenToken = data.forgottenToken;
    this.emailConfirm = data.emailConfirm;
    this.emailToken = data.emailToken;
    this.operator = data.operator;
    this.territory = data.territory;
    this.hasResetPassword = data.hasResetPassword;
    this.forgottenAt = data.forgottenAt;
    this.emailChangeAt = data.emailChangeAt;
    this.lastConnectedAt = data.lastConnectedAt;
    this.deletedAt = data.deletedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  get fullname() {
    return `${this.firstname} ${this.lastname}`;
  }
}
