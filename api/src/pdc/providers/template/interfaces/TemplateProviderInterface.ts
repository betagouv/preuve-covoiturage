import { ProviderInterface } from '@ilos/common/index.ts';
import { TemplateInterface } from '../index.ts';

export interface TemplateProviderInterface extends ProviderInterface {
  render<T = any>(template: TemplateInterface<T>): string;
}

export abstract class TemplateProviderInterfaceResolver implements TemplateProviderInterface {
  abstract render<T = any>(template: TemplateInterface<T>): string;
}
