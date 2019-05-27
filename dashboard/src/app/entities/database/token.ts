export class Token {
  public _id: string;
  public name: string;
  public token: string;
  public createdAt: string;

  constructor(obj?: any) {
    this._id = (obj && obj.id) || null;
    this.name = (obj && obj.name) || null;
    this.token = (obj && obj.token) || null;
    this.createdAt = (obj && obj.createdAt) || null;
  }
}
