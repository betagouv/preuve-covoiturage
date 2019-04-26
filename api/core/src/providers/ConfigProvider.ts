import fs from 'fs';
import path from 'path';
import jsYaml from 'js-yaml';
import { camelCase, get } from 'lodash';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { KernelInterface } from '../interfaces/KernelInterface';

import { EnvProvider } from './EnvProvider';

export class ConfigProvider implements ProviderInterface {
  readonly signature: string = 'config';
  private kernel: KernelInterface;
  private config: object = {};
  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

  boot() {
    // recommended : set the CONFIG_DIR as env variable
    const configFolder = path.resolve(
      process.cwd(),
      (<EnvProvider>this.kernel.get('env')).get('CONFIG_DIR', './config'),
    );
    // Load all .yml files from the config/ folder
    if (fs.existsSync(configFolder)) {
      fs.readdirSync(configFolder, 'utf8').forEach((basename) => {
        if (basename.indexOf('.yml') !== -1) {
          this.config[camelCase(basename.replace('.yml', ''))] = jsYaml.safeLoad(fs.readFileSync(`${configFolder}/${basename}`, 'utf8'));
        }
      });
    }
  }

  get(key: string, fallback?: any): any {
    return get(this.config, key, fallback);
  }
}
