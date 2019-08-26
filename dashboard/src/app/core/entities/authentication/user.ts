import { groupType, roleType } from '~/core/types/mainType';

import { IModel } from '../IModel';

export class User implements IModel {
  public _id: string;
  public email: string;
  public lastname: string;
  public firstname: string;
  public fullname: string;
  public password: string;
  public phone: string;
  public group: groupType;
  public role: roleType;
  public aom: string;
  public operator: string;
  public permissions: [string];

  // public company: OrganisationCompany;

  constructor(obj?: any) {
    this._id = (obj && obj._id) || null;
    this.email = (obj && obj.email) || null;
    this.lastname = (obj && obj.lastname) || null;
    this.firstname = (obj && obj.firstname) || null;
    this.fullname = (obj && obj.fullName) || null;
    this.password = (obj && obj.password) || null;
    this.phone = (obj && obj.phone) || null;
    this.group = (obj && obj.group) || null;
    this.role = (obj && obj.role) || null;
    this.aom = (obj && obj.role) || null;
    this.operator = (obj && obj.role) || null;
    this.permissions = (obj && obj.permissions) || [];
    /*
     this.company = (obj && obj.company) || {
      name: null,
      link: null,
      icon: null,
    };
    */
  }
}
