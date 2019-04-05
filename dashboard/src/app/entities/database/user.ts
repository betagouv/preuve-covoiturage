export class User {
  public _id: string;
  public email: string;
  public lastname: string;
  public firstname: string;
  public fullname: string;
  public password: string;
  public phone: string;
  public group: string;
  public role: string;
  public permissions: [string];


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.lastname = obj && obj.lastname || null;
    this.firstname = obj && obj.firstname || null;
    this.fullname = obj && obj.fullname || null;
    this.password = obj && obj.password || null;
    this.phone = obj && obj.phone || null;
    this.group = obj && obj.group || null;
    this.role = obj && obj.role || null;
    this.permissions = obj && obj.permissions || [];
  }
}

