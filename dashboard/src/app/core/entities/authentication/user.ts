import { userGroupRole, Roles } from '~/core/enums/user/roles';
import { Groups } from '~/core/enums/user/groups';
import { UserInterface } from '~/core/interfaces/user/profileInterface';

import { FormModel } from '~/core/entities/IFormModel';
import { MapModel } from '~/core/entities/IMapModel';
import { Clone } from '~/core/entities/IClone';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';

import { Model } from '../IModel';
import { UserListInterface } from '../api/shared/user/common/interfaces/UserListInterface';

export class BaseUser implements Model, UserListInterface {
  public _id: number;
  public email: string;
  public lastname: string;
  public firstname: string;
  public phone: string;
  public status: string;
  public group: Groups;
  public role: Roles;
  public operator_id: number | null;
  public territory_id: number | null;
}

export class User
  extends BaseUser
  implements FormModel, MapModel<User, UserInterface>, Clone<User>, UserPatchInterface, UserInterface {
  public permissions: string[];

  static formValueToUserPatch(formValues): UserPatchInterface {
    const userPatch: UserPatchInterface = {};
    if (formValues.email) userPatch.email = formValues.email;
    if (formValues.firstname) userPatch.firstname = formValues.firstname;
    if (formValues.lastname) userPatch.lastname = formValues.lastname;
    if (formValues.phone) userPatch.phone = formValues.phone;
    if (formValues.role) userPatch.role = formValues.role;

    return userPatch;
  }

  // todo: don't set default user
  constructor(obj?: Partial<UserInterface>) {
    super();
    this.map({
      _id: null,
      email: null,
      lastname: null,
      firstname: null,
      phone: null,
      group: null,
      role: null,
      permissions: [],
      ...obj,
    });
  }

  map(obj: UserInterface): User {
    if (obj._id) this._id = obj._id;
    if (obj.email) this.email = obj.email;
    if (obj.lastname) this.lastname = obj.lastname;
    if (obj.firstname) this.firstname = obj.firstname;
    if (obj.phone) this.phone = obj.phone;
    if (obj.group) this.group = obj.group;
    if (obj.role) this.role = obj.role;
    if (obj.permissions) this.permissions = obj.permissions;

    if (obj.operator_id) {
      this.operator_id = obj.operator_id;
    }

    if (obj.territory_id) {
      this.territory_id = obj.territory_id;
    }

    return this;
  }

  toFormValues(): any {
    return {
      firstname: this.firstname ?? null,
      lastname: this.lastname ?? null,
      email: this.email ?? null,
      phone: this.phone ?? null,
      role: this.role ? this.role.split('.').pop() : null,
      group: this.group ?? null,
      territory_id: this.territory_id ?? null,
      operator_id: this.operator_id ?? null,
    };
  }

  updateFromFormValues(formValues: any): User {
    this.map(formValues);

    this.email = formValues.email.trim();
    this.lastname = formValues.lastname.trim();
    this.firstname = formValues.firstname.trim();

    formValues.phone = formValues.phone ?? null;

    // remove unwanted values depending on group
    switch (this.group) {
      case Groups.Operator:
        delete formValues.territory_id;
        delete this.territory_id;
        if (formValues.operator_id) this.operator_id = +formValues.operator_id;
        break;
      case Groups.Territory:
        delete formValues.operator_id;
        delete this.operator_id;
        if (formValues.territory_id) this.territory_id = +formValues.territory_id;
        break;
      default:
        delete formValues.territory_id;
        delete this.territory_id;
        delete formValues.operator_id;
        delete this.operator_id;
    }

    delete this.permissions;

    // patch cannot change group/territory/operator ????
    if (this._id) {
      delete this.territory_id;
      delete this.operator_id;
      delete this.group;
    }

    // role has a weird patch behaviour...
    this.role = this._id ? formValues.role : (`${userGroupRole[formValues.group]}.${formValues.role}` as Roles);

    return this;
  }

  clone(): User {
    return new User(this);
  }
}
