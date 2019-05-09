import fs from 'fs';
import vm from 'vm';
import path from 'path';
import jsYaml from 'js-yaml';
import { camelCase, get, set } from 'lodash';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { EnvProvider } from './EnvProvider';
import { provider } from '../container';

/**
 * Config provider
 * @export
 * @class ConfigProvider
 * @implements {ProviderInterface}
 */
@provider()
export class ConfigProvider implements ProviderInterface {
  readonly signature: string = 'config';
  private config: object = {};

  constructor(protected env: EnvProvider) {}

  async boot() {
    // recommended : set the CONFIG_DIR as env variable
    const configFolder = path.resolve(
      process.cwd(),
      this.env.get('APP_CONFIG_DIR', './config'),
    );

    const sandbox = {
      env: (key: string, fallback?: string) => this.env.get(key, fallback),
      module: {
        exports: {},
      },
      exports: {},
      Object: Object,
      Function: Function,
      Array: Array,
      String: String,
      Boolean: Boolean,
      Number: Number,
      Date: Date,
      RegExp: RegExp,
      Error: Error,
      EvalError: EvalError,
      RangeError: RangeError,
      ReferenceError: ReferenceError,
      SyntaxError: SyntaxError,
      TypeError: TypeError,
      URIError: URIError,  
    };

    if (fs.existsSync(configFolder)) {
      fs.readdirSync(configFolder, 'utf8').forEach((basename) => {
        const filename = `${configFolder}/${basename}`;
        if (/\.yml$/.test(basename)) {
          this.set(camelCase(basename.replace('.yml', '')), jsYaml.safeLoad(fs.readFileSync(filename, 'utf8')))
        }
        if (/\.js$/.test(basename)) {
          const script = fs.readFileSync(filename, 'utf8');
          let configExport;
          vm.runInNewContext(script, sandbox);
          if (Reflect.ownKeys(sandbox.module.exports).length > 0) {
            configExport = sandbox.module.exports;
          } else if (Reflect.ownKeys(sandbox.exports).length > 0) {
            configExport = sandbox.exports;
          }

          if (configExport) {
            this.set(camelCase(basename.replace('.js', '')), configExport);
          }
        }
      });
    }
  }

  get(key: string, fallback?: any): any {
    return get(this.config, key, fallback);
  }

  set(key: string, value: any): void {
    set(this.config, key, value);
  }
}
