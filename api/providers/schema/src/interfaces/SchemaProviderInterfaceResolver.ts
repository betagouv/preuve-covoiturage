import { JSONSchema7 } from 'json-schema';

import { SchemaProviderInterface } from '.';

export abstract class SchemaProviderInterfaceResolver implements SchemaProviderInterface {
  readonly store: Map<string, JSONSchema7>;
  all(): JSONSchema7[] {
    throw new Error('Not implemented');
  }

  get(path: string): JSONSchema7 {
    throw new Error('Not implemented');
  }
}
