/* tslint:disable:variable-name*/

export class Bank {
  bank_name: string;
  client_name: string;
  iban: string;
  bic: string;

  constructor(obj?: any) {
    this.bank_name = obj && obj.bank_name || null;
    this.client_name = obj && obj.client_name || null;
    this.iban = obj && obj.iban || null;
    this.bic = obj && obj.bic || null;
  }
}
