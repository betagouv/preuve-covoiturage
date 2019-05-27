import ajv from 'ajv';
import { Container, Providers } from '@pdc/core';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';
import { Types } from '@pdc/core';
import { ValidatorProviderInterface } from './ValidatorProviderInterface';
import { Cache } from './Cache';

@Container.provider()
export class ValidatorProvider implements ValidatorProviderInterface {
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

  registerValidator(definition: any, target?: Types.NewableType<any> | string): ValidatorProviderInterface {
    return this.addSchema(definition, target);
  }

  registerCustomKeyword(def: {
    name: string,
    type: string,
    definition: ajv.FormatValidator | ajv.FormatDefinition | ajv.KeywordDefinition,
  }): ValidatorProviderInterface {
    const { name, type, definition } = def;
    switch(type) {
      case 'format':
        return this.addFormat(name, <ajv.FormatValidator | ajv.FormatDefinition>definition);
      case 'keyword':
        return this.addKeyword(name, <ajv.KeywordDefinition>definition);
      default:
        return this;
    }
  }

  protected addSchema(schema: object, target?: Types.NewableType<any> | string): ValidatorProviderInterface {
    if (!this.ajv.validateSchema(schema)) {
      throw new Error(this.ajv.errorsText(this.ajv.errors));
    }

    if (!this.isSchemaSecure(schema)) {
      console.log(schema)
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
      throw new Error(this.ajv.errorsText(validator.errors));
    }
    return true;
  }

  protected addFormat(name: string, format: ajv.FormatValidator | ajv.FormatDefinition): ValidatorProviderInterface {
    this.ajv.addFormat(name, format);
    return this;
  }

  protected addKeyword(keyword: string, definition: ajv.KeywordDefinition): ValidatorProviderInterface {
    this.ajv.addKeyword(keyword, definition);
    return this;
  }
}
