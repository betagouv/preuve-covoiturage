import ajv from 'ajv';
import { Container, Providers, Interfaces } from '@pdc/core';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';
import { NewableType } from '@pdc/core/dist/types';

import { Cache } from './Cache';

@Container.provider()
export class JsonSchemaProvider implements Interfaces.ProviderInterface {
  protected ajv: ajv.Ajv;
  protected bindings: Map<any, ajv.ValidateFunction> = new Map();
  protected cache: Cache = new Cache();
  protected isSchemaSecure: ajv.ValidateFunction;

  constructor(
    protected config: Providers.ConfigProvider,
  ) {}

  boot() {
    const ajvConfig = {
      $data: true,
      logger: console,
      missingRefs: true,
      extendRefs: 'fail',
      removeAdditional: true,
      useDefaults: true,
      coerceTypes: false,
      strictKeywords: true,
      cache: this.cache,

      ...this.config.get('ajv.config', {}),
    };

    this.ajv = new ajv(ajvConfig);
    this.isSchemaSecure = this.ajv.compile(jsonSchemaSecureJson);
  }

  addSchema(schema: object, target?: NewableType<any>): JsonSchemaProvider {
    if (!this.ajv.validateSchema(schema)) {
      throw new Error(this.ajv.errorsText(this.ajv.errors));
    }

    if (!this.isSchemaSecure(schema)) {
      throw new Error(this.ajv.errorsText(this.isSchemaSecure.errors));
    }

    if (target) {
      this.bindings.set(target, this.ajv.compile(schema));
    } else {
      this.ajv.addSchema(schema);
    }
    return this;
  }

  async validate(data: any): Promise<boolean> {
    if (!this.bindings.has(data.constructor)) {
      throw new Error('No schema provided for this type');
    }
    const validator = this.bindings.get(data.constructor);
    const valid = await validator(data);
    if (!valid) {
      throw new Error(this.ajv.errorsText(validator.errors));
    }
    return true;
  }

  addFormat(name: string, format: ajv.FormatValidator | ajv.FormatDefinition): JsonSchemaProvider {
    this.ajv.addFormat(name, format);
    return this;
  }

  addKeyword(keyword: string, definition: ajv.KeywordDefinition): JsonSchemaProvider {
    this.ajv.addKeyword(keyword, definition);
    return this;
  }
}
