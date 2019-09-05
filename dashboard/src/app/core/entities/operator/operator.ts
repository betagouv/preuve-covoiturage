/* tslint:disable:variable-name*/
import { Address } from '../shared/address';
import { Bank } from '../shared/bank';
import { CGU } from '../shared/cgu';
import { Company } from '../shared/company';
import { Contacts } from '../shared/contacts';

class Operator {
  public _id: string;
  public nom_commercial: string;
  public raison_sociale: string;

  public company?: Company;

  public address?: Address;

  public contacts?: Contacts;

  public bank?: Bank;

  constructor(data: {
    _id: string;
    nom_commercial: string;
    raison_sociale: string;
    company?: Company;
    address?: Address;
    contacts?: Contacts;
    bank?: Bank;
  }) {
    this._id = data._id;
    this.nom_commercial = data.nom_commercial;
    this.raison_sociale = data.raison_sociale;
    this.company = data.company || new Company({ siren: null });
    this.address = data.address || new Address({ street: null, postcode: null, city: null, country: null });
    this.contacts = data.contacts || new Contacts();
    this.bank = data.bank || new Bank();
  }
}

export { Address, Bank, CGU, Company, Contacts, Operator };
