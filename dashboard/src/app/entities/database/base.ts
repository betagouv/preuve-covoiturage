export class Base {
  public _id: string;


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
  }
}
