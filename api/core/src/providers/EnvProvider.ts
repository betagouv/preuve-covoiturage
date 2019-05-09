import dotenv from 'dotenv';
import path from 'path';

import { provider } from '../container';

import { ProviderInterface } from '../interfaces/ProviderInterface';


/**
 * Env provider
 * @export
 * @class EnvProvider
 * @implements {ProviderInterface}
 */
@provider()
export class EnvProvider implements ProviderInterface {
  private env: Map<string, any> = new Map();

  boot() {
    let envPath = path.resolve(process.cwd(), '.env');

    if ('APP_ROOT_PATH' in process.env) {
      envPath = path.resolve(process.env.APP_ROOT_PATH, '.env');
    }

    const result = dotenv.config({ path: envPath });

    if (!result.error) {
      Reflect.ownKeys(result.parsed).forEach((key: string) => {
        this.env.set(key, result.parsed[key]);
      });
    }
    
    Reflect.ownKeys(process.env)
      .filter((key: string) => key === key.toUpperCase() && key.startsWith('APP_'))
      .forEach((key: string) => {
        this.env.set(key, process.env[key]);
      });
  }

  get(key: string, fallback?: any): any {
    if (!this.env.has(key)) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`Unknown env key ${key}`);
    }
    return this.env.get(key);
  }
}
