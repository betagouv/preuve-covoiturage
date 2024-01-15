export abstract class Query {
  protected abstract query: string;

  public getText(): string {
    return this.query;
  }
}
