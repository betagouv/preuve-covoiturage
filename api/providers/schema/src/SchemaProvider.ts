import { provider } from '@ilos/common';

import { JSONSchema7 } from 'json-schema';

import { SchemaProviderInterfaceResolver, SchemaProviderInterface } from './interfaces';

@provider({
  identifier: SchemaProviderInterfaceResolver,
})
export class SchemaProvider implements SchemaProviderInterface {
  readonly store: Map<string, JSONSchema7> = new Map();

  constructor() {}

  private setStore(key: string, val: JSONSchema7): void {
    this.store.set(key, val);
  }

  all() {
    return [];
  }

  get(path: string) {
    return null;
  }
}
