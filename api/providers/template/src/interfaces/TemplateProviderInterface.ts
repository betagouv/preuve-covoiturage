import { ProviderInterface } from '@ilos/common';
import { TemplateInterface, TemplateImportInterface } from '.';
import { TemplateIdentifier } from './TemplateInterface';

export interface TemplateProviderInterface extends ProviderInterface {
  import(template: TemplateImportInterface): void;
  get(id: TemplateIdentifier): TemplateInterface;
}

export abstract class TemplateProviderInterfaceResolver implements TemplateProviderInterface {
  import(_template: TemplateImportInterface): void {
    throw new Error();
  }
  get(_id: TemplateIdentifier): TemplateInterface {
    throw new Error();
  }
}
