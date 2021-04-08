export interface TemplateInterface<Data = any> {
  readonly data: Data;
}

export interface StaticTemplateInterface<Data = any> {
  readonly template: string;
  new(data: Data): TemplateInterface<Data>;
}
