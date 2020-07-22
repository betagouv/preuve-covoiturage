import ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';

import { provider, ConfigInterfaceResolver, NewableType, ValidatorInterface } from '@ilos/common';

import { Cache } from './Cache';

@provider()
export class AjvValidator implements ValidatorInterface {
  protected ajv: ajv.Ajv;
  protected bindings: Map<any, ajv.ValidateFunction> = new Map();
  protected cache: Cache = new Cache();
  protected isSchemaSecure: ajv.ValidateFunction;

  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const ajvConfig = {
      $data: true,
      logger: console,
      missingRefs: true,
      extendRefs: 'fail',
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: false,
      strictKeywords: false,
      cache: this.cache,

      ...this.config.get('ajv.config', {}),
    };

    this.ajv = new ajv(ajvConfig);

    // activate ajv-keywords plugin
    ajvKeywords(this.ajv);

    this.isSchemaSecure = this.ajv.compile(jsonSchemaSecureJson);
  }

  registerValidator(definition: any, target?: NewableType<any> | string): ValidatorInterface {
    return this.addSchema(definition, target);
  }

  registerCustomKeyword(def: {
    name: string;
    type: string;
    definition: ajv.FormatValidator | ajv.FormatDefinition | ajv.KeywordDefinition;
  }): ValidatorInterface {
    const { name, type, definition } = def;
    switch (type) {
      case 'format':
        return this.addFormat(name, definition as ajv.FormatValidator | ajv.FormatDefinition);
      case 'keyword':
        return this.addKeyword(name, definition as ajv.KeywordDefinition);
      default:
        return this;
    }
  }

  protected addSchema(schema: object, target?: NewableType<any> | string): ValidatorInterface {
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

  async validate(data: any, schema?: string): Promise<boolean> {
    const resolver = schema ? schema : data.constructor;

    if (!this.bindings.has(resolver)) {
      throw new Error('No schema provided for this type');
    }
    const validator = this.bindings.get(resolver);
    const valid = await validator(data);
    if (!valid) {
      throw new Error(JSON.stringify(validator.errors));
    }
    return true;
  }

  protected addFormat(name: string, format: ajv.FormatValidator | ajv.FormatDefinition): ValidatorInterface {
    this.ajv.addFormat(name, format);
    return this;
  }

  protected addKeyword(keyword: string, definition: ajv.KeywordDefinition): ValidatorInterface {
    this.ajv.addKeyword(keyword, definition);
    return this;
  }
}
