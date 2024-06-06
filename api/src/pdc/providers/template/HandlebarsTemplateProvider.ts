import Handlebars, { HelperDelegate, TemplateDelegate } from 'handlebars';

import { InitHookInterface, provider } from '@/ilos/common/index.ts';

import { TemplateInterface, TemplateProviderInterface, TemplateProviderInterfaceResolver } from './interfaces/index.ts';
import { currency } from './helpers/currency.ts';
import { TemplateRenderingException } from './exceptions/index.ts';
import { StaticTemplateInterface } from './interfaces/TemplateInterface.ts';

@provider({
  identifier: TemplateProviderInterfaceResolver,
})
export class HandlebarsTemplateProvider implements TemplateProviderInterface, InitHookInterface {
  protected helpers: Map<string, HelperDelegate> = new Map([['currency', currency]]);

  protected templateMap: Map<StaticTemplateInterface, TemplateDelegate> = new Map();
  protected hbs: typeof Handlebars;

  init() {
    this.hbs = Handlebars.create();
    this.registerHelpers();
  }

  protected registerHelpers() {
    for (const [id, helper] of this.helpers) {
      this.hbs.registerHelper(id, helper);
    }
  }

  render<T = any>(template: TemplateInterface<T>): string {
    try {
      const templateCtor = template.constructor as StaticTemplateInterface;
      if (!this.templateMap.has(templateCtor)) {
        this.cache(templateCtor);
      }
      return this.templateMap.get(templateCtor)(template.data);
    } catch (e) {
      throw new TemplateRenderingException(e.message);
    }
  }

  protected cache(template: StaticTemplateInterface) {
    this.templateMap.set(template, this.hbs.compile(template.template));
  }
}
