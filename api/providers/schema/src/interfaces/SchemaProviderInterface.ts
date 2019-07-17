import { JSONSchema7 } from 'json-schema';

import { ProviderInterface } from '@ilos/common';

export interface SchemaProviderInterface extends ProviderInterface {
  readonly store: Map<string, JSONSchema7>;
  all(): JSONSchema7[];
  get(path: string): JSONSchema7;
}
