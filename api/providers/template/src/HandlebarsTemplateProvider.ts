import Handlebars, { HelperDelegate, TemplateDelegate } from 'handlebars';

import { InitHookInterface, provider } from '@ilos/common';

import { TemplateInterface, TemplateProviderInterface, TemplateProviderInterfaceResolver } from './interfaces';
import { currency } from './helpers/currency';
import { TemplateRenderingException } from './exceptions';
import { StaticTemplateInterface } from './interfaces/TemplateInterface';

@provider({
  identifier: TemplateProviderInterfaceResolver,
})
export class HandlebarsTemplateProvider implements TemplateProviderInterface, InitHookInterface {
  protected helpers: Map<string, HelperDelegate> = new Map([
    ['currency', currency],
  ]);

  protected templateMap: Map<StaticTemplateInterface, TemplateDelegate> = new Map();
  protected hbs: typeof Handlebars;

  init() {
    this.hbs = Handlebars.create();
    this.registerHelpers();
  }

  protected registerHelpers() {
    for(let [id, helper] of this.helpers) {
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
