import fs from 'fs';
import path from 'path';
import jsYaml from 'js-yaml';
import { camelCase, get } from 'lodash';

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

  boot() {
    // recommended : set the CONFIG_DIR as env variable
    const configFolder = path.resolve(
      process.cwd(),
      this.env.get('CONFIG_DIR', './config'),
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
