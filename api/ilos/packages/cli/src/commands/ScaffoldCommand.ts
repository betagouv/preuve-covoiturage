// import path from 'path';
// import fs from 'fs';

import {
  command,
  CommandOptionType,
  // TemplateInterfaceResolver,
} from '@ilos/common';

import { Command } from '../parents/Command';

/**
 * Command to scaffold service, provider, handlers...
 * @export
 * @class CallCommand
 * @extends {Command}
 */
@command()
export class ScaffoldCommand extends Command {
  static readonly signature: string = 'generate <type> [name]';
  static readonly description: string = 'Generate service, provider, or handler';
  static readonly options: CommandOptionType[] = [];

  // constructor(private template: TemplateInterfaceResolver) {
  //   super();
  // }

  public async call(type: string, name?: string): Promise<string> {
    throw new Error('This feature is broken');
    // this.loadStubs();
    // return this.generate(type, { name });
  }

  // protected loadStubs() {
  //   const stubPath = path.resolve(__dirname, '..', 'stubs');
  //   this.template.loadTemplatesFromDirectory(stubPath, {
  //     ServiceProvider: {
  //       filenameTemplate: '{{name}}ServiceProvider.ts',
  //       relativePath: './src',
  //     },
  //     Provider: {
  //       filenameTemplate: '{{name}}Provider.ts',
  //       relativePath: './src/providers',
  //     },
  //     Handler: {
  //       filenameTemplate: '{{name}}Action.ts',
  //       relativePath: './src/actions',
  //     },
  //   });
  // }

  // protected generate(templateName: string, params: any = {}): string {
  //   try {
  //     const metadata = this.template.getMetadata(templateName);
  //     const fileContent = this.template.get(templateName, params);
  //     const fileName = this.template.render(metadata.filenameTemplate, params);
  //     const filePath = path.resolve(process.cwd(), metadata.relativePath, fileName);
  //     if (fs.existsSync(filePath)) {
  //       throw new Error(`File already exists ${filePath}`);
  //     }

  //     try {
  //       fs.mkdirSync(path.resolve(process.cwd(), metadata.relativePath), { recursive: true });
  //     } catch (err) {
  //       if (err.code !== 'EEXIST') throw err;
  //     }

  //     fs.writeFileSync(filePath, fileContent);
  //     return `File properly generated in ${filePath}`;
  //   } catch (e) {
  //     return e.message;
  //   }
  // }
}
