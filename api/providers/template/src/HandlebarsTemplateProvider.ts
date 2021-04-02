import Handlebars, { HelperDelegate } from 'handlebars';

import { InitHookInterface, provider } from '@ilos/common';

import { TemplateIdentifier, TemplateImportInterface, TemplateInterface, TemplateProviderInterface, TemplateProviderInterfaceResolver } from './interfaces';
import { currency } from './helpers/currency';

@provider({
  identifier: TemplateProviderInterfaceResolver,
})
export class HandlebarsTemplateProvider implements TemplateProviderInterface, InitHookInterface {
  protected helpers: Map<string, HelperDelegate> = new Map([
    ['currency', currency],
  ]);
  protected templates: Map<TemplateIdentifier, TemplateInterface> = new Map();
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

  import(template: TemplateImportInterface): void {
    if (!this.templates.has(template.id)) {
      this.templates.set(template.id, {
        template: this.hbs.compile(template.template),
        metadata: template.metadata,
      });
    }
  }

  get(id: TemplateIdentifier): TemplateInterface {
    if (this.templates.has(id)) {
      return this.templates.get(id);
    }

    throw new Error(`Template ${id} not found`);
  }
}
