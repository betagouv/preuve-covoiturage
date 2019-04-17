/* tslint:disable:variable-name*/


export class Contact {
  phone: number;
  email: String;
  rgpd_dpo: string;
  rgpd_controller: string;
  technical: string;

  constructor(obj?: any) {
    this.phone = obj && obj.phone || null;
    this.email = obj && obj.email || null;
    this.rgpd_dpo = obj && obj.rgpd_dpo || null;
    this.rgpd_controller = obj && obj.rgpd_controller || null;
    this.technical = obj && obj.technical || null;
  }
}

