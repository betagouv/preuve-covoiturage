export interface SendTemplateByEmailParamsInterface {
  template: string;
  email: string;
  fullname: string;
  opts: {
    organization?: string;
    link?: string;
  };
}
