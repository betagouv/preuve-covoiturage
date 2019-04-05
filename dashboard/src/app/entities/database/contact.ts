/* tslint:disable:variable-name*/

import { User } from './user/user';

export class Contact {
  phone: number;
  email: String;
  rgpd_dpo: User;
  rgpd_controller: User;
  technical: User;

  constructor(obj?: any) {
    this.phone = obj && obj.phone || null;
    this.email = obj && obj.email || null;
    this.rgpd_dpo = obj && obj.rgpd_dpo || new User();
    this.rgpd_controller = obj && obj.rgpd_controller || new User();
    this.technical = obj && obj.technical || new User();
  }
}

