export class CarUser {
  public _id: number;
  public email: string;
  public lastname: string;
  public firstname: string;
  public phone: string;


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.email = obj && obj.email || null;
    this.lastname = obj && obj.lastname || null;
    this.firstname = obj && obj.firstname || null;
    this.phone = obj && obj.phone || null;
  }
}
