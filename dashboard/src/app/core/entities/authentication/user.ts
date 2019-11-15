import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserInterface, UserPermissionsType } from '~/core/interfaces/user/profileInterface';

import { IModel } from '../IModel';

export class BaseUser implements IModel {
  public _id: number;
  public email: string;
  public lastname: string;
  public firstname: string;
  public phone: string;
  public status?: string;
  public group: UserGroupEnum;
  public role: UserRoleEnum;

  // tslint:disable-next-line:variable-name
  public operator_id?: number;
  // tslint:disable-next-line:variable-name
  public territory_id?: number;
}

export class User extends BaseUser {
  public permissions: UserPermissionsType;

  // todo: don't set default user
  constructor(
    obj: UserInterface = {
      _id: null,
      email: null,
      lastname: null,
      firstname: null,
      phone: null,
      group: null,
      role: null,
      permissions: [],
    },
  ) {
    super();
    this._id = obj._id;
    this.email = obj.email;
    this.lastname = obj.lastname;
    this.firstname = obj.firstname;
    this.phone = obj.phone;
    this.group = obj.group;
    this.role = obj.role;
    this.permissions = obj.permissions;

    if (obj.operator_id) {
      this.operator_id = obj.operator_id;
    }
    if (obj.territory_id) {
      this.territory_id = obj.territory_id;
    }
  }
}
