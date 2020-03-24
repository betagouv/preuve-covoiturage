import { ProviderInterface } from '@ilos/common';

export interface TemplateInterface extends ProviderInterface {
  loadTemplatesFromDirectory(templatePath: string, metadata?: { [key: string]: any }): void;

  setMetadata(templateName: string, metadata: any): void;

  getMetadata(templateName: string): any;

  set(templateName: string, template: string): void;

  get(templateName: string, opts: any): string;

  render(template: string, opts: any): string;
}

export abstract class TemplateInterfaceResolver implements TemplateInterface {
  loadTemplatesFromDirectory(templatePath: string, metadata?: { [key: string]: any }): void {
    throw new Error();
  }

  setMetadata(templateName: string, metadata: any): void {
    throw new Error();
  }

  getMetadata(templateName: string): any {
    throw new Error();
  }

  set(templateName: string, template: string): void {
    throw new Error();
  }

  get(templateName: string, opts: any): string {
    throw new Error();
  }

  render(template: string, opts: any): string {
    throw new Error();
  }
}
