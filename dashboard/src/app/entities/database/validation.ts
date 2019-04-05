export class Validation {
  public validated: false;
  public validatedAt: null;
  public rank: null;

  constructor(obj?: any) {
    this.validated = obj && obj.validated || null;
    this.validatedAt = obj && obj.validatedAt || null;
    this.rank = obj && obj.rank || null;
  }
}
