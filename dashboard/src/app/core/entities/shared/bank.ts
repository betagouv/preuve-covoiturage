/* tslint:disable:variable-name*/
export class Bank {
  public bank_name: string;
  public client_name: string;
  public iban: string;
  public bic: string;

  constructor(
    obj: { bank_name: string; client_name: string; iban: string; bic: string } = {
      bank_name: null,
      client_name: null,
      iban: null,
      bic: null,
    },
  ) {
    this.bank_name = obj.bank_name;
    this.client_name = obj.client_name;
    this.iban = obj.iban;
    this.bic = obj.bic;
  }
}
