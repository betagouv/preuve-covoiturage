import dotenv from 'dotenv';

import { ProviderInterface } from '../interfaces/ProviderInterface';
import { KernelInterface } from '../interfaces/KernelInterface';

export class EnvProvider implements ProviderInterface {
  readonly signature: string = 'env';

  private kernel: KernelInterface;
  private env: Map<string, any> = new Map();

  constructor(kernel: KernelInterface) {
    this.kernel = kernel;
  }

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
