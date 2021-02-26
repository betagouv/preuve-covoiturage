import * as ajv from 'ajv';
import ajvKeywords from 'ajv-keywords';
import addFormats from 'ajv-formats';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';

import { provider, ConfigInterfaceResolver, NewableType, ValidatorInterface } from '@ilos/common';

@provider()
export class AjvValidator implements ValidatorInterface {
  protected ajv: ajv.default;
  protected bindings: Map<any, ajv.ValidateFunction> = new Map();
  protected isSchemaSecure: ajv.ValidateFunction;

  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const ajvConfig = {
      strict: false,
      $data: true,
      logger: console,
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: false,
      ...this.config.get('ajv.config', {}),
    };

    this.ajv = new ajv.default(ajvConfig);

    // activate ajv-keywords plugin
    ajvKeywords(this.ajv);
    addFormats(this.ajv)

    this.isSchemaSecure = new ajv.default({ strict: false })
      .compile(jsonSchemaSecureJson);
  }

  registerValidator(definition: { [k: string]: any }, target?: NewableType<any> | string): ValidatorInterface {
    return this.addSchema(definition, target);
  }

  registerCustomKeyword(def: {
    name?: string;
    type: string;
    definition: ajv.Format | ajv.KeywordDefinition;
  }): ValidatorInterface {
    const { name, type, definition } = def;
    switch (type) {
      case 'format':
        return this.addFormat(name, definition as ajv.Format);
      case 'keyword':
        return this.addKeyword(definition as ajv.KeywordDefinition);
      default:
        return this;
    }
  }

  protected validateSchema(schema: {[k: string]: any}): void {
    if (!this.ajv.validateSchema(schema)) {
      throw new Error(this.ajv.errorsText(this.ajv.errors));
    }

    if (!this.isSchemaSecure(schema)) {
      throw new Error(this.ajv.errorsText(this.isSchemaSecure.errors));
    }
  }

  protected addSchema(schema: { [k: string]: any }, target?: NewableType<any> | string): ValidatorInterface {
    try {
      console.debug(`Adding validator ${schema.$id} | ${target}`);
      this.validateSchema(schema);
      if (target) {
        const compiledSchema = typeof target === 'string' ? this.ajv.compile({
          $id: target,
          ...schema,
        }): this.ajv.compile(schema);
        this.bindings.set(target, compiledSchema);
      } else {
        this.ajv.addSchema(schema);
      }
      return this;

    } catch (e) {
      console.error(`Error during adding validator ${schema.$id} | ${target} | ${e.message}`);
      console.error(e.message, e);
      throw e;
    }
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

  protected addFormat(name: string, format: ajv.Format): ValidatorInterface {
    this.ajv.addFormat(name, format);
    return this;
  }

  protected addKeyword(definition: ajv.KeywordDefinition): ValidatorInterface {
    this.ajv.addKeyword(definition);
    return this;
  }
}
