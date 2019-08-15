export class Meta {
  pagination: object;

  constructor(obj?: any) {
    this.pagination = (obj.pagination && obj.pagination) || null;
  }
}
