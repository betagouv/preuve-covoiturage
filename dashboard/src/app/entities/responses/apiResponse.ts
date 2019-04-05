
export class ApiResponse {
  data: any;
  meta: object;


  constructor(obj) {
    this.data = obj.data;
    this.meta = obj.meta;
  }
}

