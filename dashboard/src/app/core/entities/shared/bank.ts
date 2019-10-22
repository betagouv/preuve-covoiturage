/* tslint:disable:variable-name*/
export class Bank {
  public bank_name: string;
  public client_name: string;
  public iban: string;
  public bic: string;

  constructor(obj?: { bank_name: string; client_name: string; iban: string; bic: string }) {
    if (obj && obj.bank_name) this.bank_name = obj.bank_name;
    if (obj && obj.client_name) this.client_name = obj.client_name;
    if (obj && obj.iban) this.iban = obj.iban;
    if (obj && obj.bic) this.bic = obj.bic;
  }

  toFormValues() {
    return {
      bank_name: '',
      client_name: '',
      iban: '',
      bic: '',
      ...this,
    };
  }
}
