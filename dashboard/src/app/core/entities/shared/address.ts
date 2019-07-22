export class Address {
  public street: string;
  public postcode: string;
  public cedex?: string;
  public city: string;
  public country: string;

  constructor(obj: { street: string; postcode: string; cedex?: string; city: string; country: string }) {
    this.street = obj.street;
    this.postcode = obj.postcode;
    this.cedex = obj.cedex || null;
    this.city = obj.city;
    this.country = obj.country;
  }
}
