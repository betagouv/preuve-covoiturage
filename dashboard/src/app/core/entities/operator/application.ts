/* tslint:disable:variable-name*/
import { Model } from '~/core/entities/IModel';
import { MapModel } from '~/core/entities/IMapModel';
import { BaseModel } from '~/core/entities/BaseModel';
import { Clone } from '~/core/entities/IClone';
import { ApplicationInterface } from '~/core/entities/api/shared/application/common/interfaces/ApplicationInterface';
import { FormModel } from '~/core/entities/IFormModel';

export class Application extends BaseModel
  implements Model, FormModel, MapModel<Application>, Clone<Application>, ApplicationInterface {
  _id: number;
  uuid: string;
  owner_id: number;
  owner_service: string;
  name: string;
  permissions: string[];
  created_at: Date;

  constructor(data?: {
    _id: number;
    uuid: string;
    name: string;
    owner_id: number;
    owner_service: string;
    permissions: string[];
    created_at: Date;
  }) {
    super(data);
  }

  map(data: ApplicationInterface): Application {
    super.map(data);
    this._id = data._id;
    this.uuid = data.uuid;
    this.owner_id = data.owner_id;
    this.name = data.name;
    this.created_at = new Date(data.created_at);
    return this;
  }

  clone(): Application {
    return new Application(this);
  }

  updateFromFormValues(formValues: any): void {
    this.name = formValues.name;
  }

  toFormValues(): any {
    return {
      name: this.name,
    };
  }
}
