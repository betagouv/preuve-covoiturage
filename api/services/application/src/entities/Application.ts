import { ApplicationInterface } from '@pdc/provider-schema';

export class Application implements ApplicationInterface {
  public _id: string;
  public name: string;
  // tslint:disable-next-line: variable-name
  public operator_id: string;
  public permissions: string[];
  // tslint:disable-next-line: variable-name
  public createdAt: Date;
  // tslint:disable-next-line: variable-name
  public deletedAt?: Date;

  constructor(data: ApplicationInterface) {
    this._id = data._id;
    this.name = data.name;
    this.operator_id = data.operator_id;
    this.permissions = data.permissions;
    this.createdAt = data.createdAt;
    this.deletedAt = data.deletedAt;
  }
}
