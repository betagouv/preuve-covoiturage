export type QueryTemplates<T> = Map<T, string>;

export abstract class Query {
  protected abstract query: string;
  protected abstract countQuery: string;

  public getText<TKey>(templates: QueryTemplates<TKey> = new Map()): string {
    return this.replaceTemplates<TKey>(this.query, templates);
  }

  public getCountText<TKey>(templates: QueryTemplates<TKey> = new Map()): string {
    return this.replaceTemplates<TKey>(this.countQuery, templates);
  }

  // replace templates in the query wrapped in {{template_name}}
  private replaceTemplates<TKey>(query: string, templates: QueryTemplates<TKey>): string {
    templates.forEach((value, key) => {
      query = query.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return query;
  }
}
