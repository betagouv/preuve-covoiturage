import { IModel } from '~/core/entities/IModel';
import { IMapModel } from '~/core/entities/IMapModel';

export class BaseModel implements IModel, IMapModel<BaseModel> {
  _id: number;

  constructor(data?: any) {
    if (data) this.map(data);
  }

  // tslint:disable-next-line:variable-name
  protected created_at: Date;
  // tslint:disable-next-line:variable-name
  protected updated_at: Date;

  map(data: any): BaseModel {
    if (data.created_at) this.created_at = new Date(data.created_at);
    if (data.updated_at) this.updated_at = new Date(data.updated_at);
    return this;
  }
}
