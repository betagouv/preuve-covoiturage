// tslint:disable: variable-name
import { UserInterface } from '@pdc/provider-schema';

export class User implements UserInterface {
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
  public forgotten_reset?: string;
  public forgotten_token?: string;
  public email_confirm?: string;
  public email_token?: string;
  public operator?: string = null;
  public territory?: string = null;
  public has_reset_password?: boolean;
  public forgotten_at?: Date;
  public email_change_at?: Date;
  public last_connected_at?: Date;
  public deleted_at?: Date;
  public created_at?: Date;
  public updated_at?: Date;

  constructor(data: UserInterface) {
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
    this.forgotten_reset = data.forgotten_reset;
    this.forgotten_token = data.forgotten_token;
    this.email_confirm = data.email_confirm;
    this.email_token = data.email_token;
    this.operator = data.operator;
    this.territory = data.territory;
    this.has_reset_password = data.has_reset_password;
    this.forgotten_at = data.forgotten_at;
    this.email_change_at = data.email_change_at;
    this.last_connected_at = data.last_connected_at;
    this.deleted_at = data.deleted_at;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  get fullname() {
    return `${this.firstname} ${this.lastname}`;
  }
}
