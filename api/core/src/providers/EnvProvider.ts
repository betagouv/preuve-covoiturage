import dotenv from 'dotenv';

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
    const result = dotenv.config();

    if (!result.error) {
      Reflect.ownKeys(result.parsed).forEach((key: string) => {
        this.env.set(key, result.parsed[key]);
      });
    }
  }

  get(key: string, fallback?: any): any {
    if (!this.env.has(key)) {
      if (fallback) {
        return fallback;
      }
      throw new Error(`Unknown env key ${key}`);
    }
    return this.env.get(key);
  }
}
