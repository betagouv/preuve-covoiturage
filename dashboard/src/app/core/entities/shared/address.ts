export class Address {
  public street: string;
  public postcode: string;
  public cedex?: string;
  public city: string;
  public country: string;

  constructor(obj: { street: string; postcode: string; cedex?: string; city: string; country: string }) {
    if (obj && obj.street) this.street = obj.street;
    if (obj && obj.postcode) this.postcode = obj.postcode;
    if (obj && obj.cedex) this.cedex = obj.cedex;
    if (obj && obj.city) this.city = obj.city;
    if (obj && obj.country) this.country = obj.country;
  }

  toFormValues(): any {
    return {
      street: '',
      postcode: '',
      cedex: '',
      city: '',
      country: '',
      ...this,
    };
  }
}
