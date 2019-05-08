/* tslint:disable:variable-name*/

export class Identity {
  public _id: string;
  public email: string;
  public lastname: string;
  public firstname: string;
  public company: string;
  public over_18: boolean;


  constructor(obj?: any) {
    this._id = obj && obj._id || null;
    this.lastname = obj && obj.lastname || null;
    this.firstname = obj && obj.firstname || null;
    this.company = obj && obj.company || null;
    this.over_18 = obj && obj.over_18 || null;
  }
}

