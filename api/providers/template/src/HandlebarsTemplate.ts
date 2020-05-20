// tslint:disable import-name
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';

import { provider } from '@ilos/common';

import { TemplateInterface } from './interfaces';
import { currency } from './helpers/currency';

@provider()
export class HandlebarsTemplate implements TemplateInterface {
  protected templates: Map<string, Function> = new Map();
  protected metadata: Map<string, any> = new Map();
  protected hbs: typeof Handlebars;

  constructor() {
    this.hbs = Handlebars.create();

    // register helpers
    this.hbs.registerHelper('currency', currency);
  }

  loadTemplatesFromDirectory(templatePath: string, metadata?: { [key: string]: any }): void {
    if (fs.existsSync(templatePath)) {
      fs.readdirSync(templatePath, 'utf8').forEach((basename) => {
        const filename = `${templatePath}/${basename}`;
        const fileinfo = path.parse(filename);
        if (['.handlebars', '.hbs'].indexOf(fileinfo.ext) > -1) {
          this.set(fileinfo.name, fs.readFileSync(filename, 'utf8'));
          if (metadata && fileinfo.name in metadata) {
            this.setMetadata(fileinfo.name, metadata[fileinfo.name]);
          }
        }
      });
    }
  }

  setMetadata(templateName: string, metadata: any): void {
    this.metadata.set(templateName, metadata);
  }

  getMetadata(templateName: string): any {
    if (this.metadata.has(templateName)) {
      return this.metadata.get(templateName);
    }
    throw new Error(`Template meta ${templateName} not found`);
  }

  set(templateName: string, template: string): void {
    this.templates.set(templateName, this.hbs.compile(template));
  }

  get(templateName: string, opts: any): string {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)(opts);
    }
    throw new Error(`Template ${templateName} not found`);
  }

  render(template: string, opts: any): string {
    return this.hbs.compile(template)(opts);
  }
}
