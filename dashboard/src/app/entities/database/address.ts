export class Address {
  public street: string;
  public postcode: string;
  public cedex: string;
  public city: string;
  public country: string;

  constructor(obj?: any) {
    this.street = (obj && obj.street) || null;
    this.postcode = (obj && obj.postcode) || null;
    this.cedex = (obj && obj.cedex) || null;
    this.city = (obj && obj.city) || null;
    this.country = (obj && obj.country) || null;
  }
}
