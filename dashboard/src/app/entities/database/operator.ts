  /* tslint:disable:variable-name*/
import { Company } from './company';
import { Address } from './address';
import { Bank } from './bank';
import { Contact } from './contact';

class Operator {
  public _id: string;
  public address: Address;
  public nom_commercial: string;
  public raison_sociale: string;
  public company: Company;
  public contacts: Contact;
  public bank: Bank;
  public createdAt: string;
  public updatedAt: string;

  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.address = obj && obj.address || new Address();
    this.nom_commercial = obj && obj.nom_commercial || null;
    this.raison_sociale = obj && obj.raison_sociale || null;
    this.company = obj && obj.company || new Company();
    this.bank = obj && obj.bank || new Bank();
    this.contacts = obj && obj.contacts || new Contact();
    this.createdAt = obj && obj.createdAt || null;
    this.updatedAt = obj && obj.updatedAt || null;
  }
}

export { Company, Operator, Address, Bank };
