import { ProviderInterface } from '@ilos/common';
import { TemplateDelegate } from 'handlebars';
import { TemplateInterface } from '.';

export interface TemplateProviderInterface extends ProviderInterface {
  render<T = any>(template: TemplateInterface<T>): string;
}

export abstract class TemplateProviderInterfaceResolver implements TemplateProviderInterface {
  abstract render<T = any>(template: TemplateInterface<T>): string;
}
