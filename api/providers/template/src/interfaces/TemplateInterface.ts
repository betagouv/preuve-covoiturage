import { TemplateDelegate } from 'handlebars';

export type TemplateIdentifier = string;

export interface TemplateInterface {
  template: TemplateDelegate;
  metadata: any;
}

export interface TemplateImportInterface {
  id: TemplateIdentifier;
  template: string;
  metadata: any;
}
