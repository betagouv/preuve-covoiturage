import { OperatorNameInterface } from '~/core/interfaces/operatorInterface';

export class Operator {
  public _id: string;
  // tslint:disable-next-line:variable-name
  public nom_commercial: string;

  constructor(obj?: OperatorNameInterface) {
    this._id = obj._id;
    this.nom_commercial = obj.nom_commercial;
  }
}
