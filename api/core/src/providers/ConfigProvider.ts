import fs from 'fs';
import vm from 'vm';
import path from 'path';
import jsYaml from 'js-yaml';
import { camelCase, get, set, has } from 'lodash';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { EnvProvider } from './EnvProvider';
import { provider } from '../container';

@provider()
export class ConfigProvider implements ProviderInterface {
  readonly signature: string = 'config';
  protected config: object = {};
  private configPaths: Set<string> = new Set();
  constructor(protected env: EnvProvider) {}

  async boot() {
    this.loadConfigDirectory(this.env.get('APP_WORKING_PATH', process.cwd()));
  }

  loadConfigDirectory(workingPath: string, configDir?: string) {
    const configFolder = path.resolve(workingPath, configDir ? configDir : this.env.get('APP_CONFIG_DIR', './config'));

    if (!fs.existsSync(configFolder) || !fs.lstatSync(configFolder).isDirectory()) {
      throw new Error(`Config path ${configFolder} is not a directory`);
    }

    if (this.configPaths.has(configFolder)) {
      return;
    }

    this.configPaths.add(configFolder);
    fs.readdirSync(configFolder, 'utf8').forEach((basename) => {
      const filename = `${configFolder}/${basename}`;
      const fileinfo = path.parse(filename);
      if (['.yaml', '.yml'].indexOf(fileinfo.ext) > -1) {
        this.set(camelCase(fileinfo.name), this.loadYmlFile(filename));
      }

      if (['.js'].indexOf(fileinfo.ext) > -1) {
        const configExport = this.loadJsFile(filename);
        if (configExport) {
          this.set(camelCase(fileinfo.name), configExport);
        }
      }
    });
  }

  private loadJsFile(filename) {
    // default sandbox config
    const sandbox = {
      Object,
      Function,
      Array,
      String,
      Boolean,
      Number,
      Date,
      RegExp,
      Error,
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      env: (key: string, fallback?: string) => this.env.get(key, fallback),
      module: {
        exports: {},
      },
      exports: {},
    };

    const script = fs.readFileSync(filename, 'utf8');
    let configExport;
    try {
      vm.runInNewContext(script, sandbox);
      if (Reflect.ownKeys(sandbox.module.exports).length > 0) {
        configExport = sandbox.module.exports;
      } else if (Reflect.ownKeys(sandbox.exports).length > 0) {
        configExport = sandbox.exports;
      }
      return configExport;
    } catch (e) {
      throw e;
    }
  }

  private loadYmlFile(filename) {
    return jsYaml.safeLoad(fs.readFileSync(filename, 'utf8'));
  }

  get(key: string, fallback?: any): any {
    if (fallback === undefined && !has(this.config, key)) {
      throw new Error(`Unknown config key ${key}`);
    }
    return get(this.config, key, fallback);
  }

  set(key: string, value: any): void {
    if (has(this.config, key)) {
      throw new Error(`Duplicate config key ${key}`);
    }
    set(this.config, key, value);
  }
}
