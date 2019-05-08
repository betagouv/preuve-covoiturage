export class Validation {
  public validated: boolean;
  public validatedAt: Date;
  public rank: { 'A', 'B', 'C', 'Z' };

  constructor(obj?: any) {
    this.validated = obj && obj.validated || null;
    this.validatedAt = obj && obj.validatedAt || null;
    this.rank = obj && obj.rank || null;
  }
}
