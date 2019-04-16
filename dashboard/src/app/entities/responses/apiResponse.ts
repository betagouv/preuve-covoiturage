import { Meta } from '~/entities/responses/meta';

export class ApiResponse {
  data: any;
  meta: Meta;


  constructor(obj) {
    this.data = obj.data;
    this.meta = obj.meta;
  }
}

