import { Ajv, ValidateFunction, Format, KeywordDefinition, ErrorObject } from 'ajv';
import ajvErrors from 'ajv-errors';
import addFormats from 'ajv-formats';
import ajvKeywords from 'ajv-keywords';
import jsonSchemaSecureJson from 'ajv/lib/refs/json-schema-secure.json';

import {
  ConfigInterfaceResolver,
  InvalidParamsException,
  NewableType,
  ValidatorInterface,
  provider,
} from '@ilos/common/index.ts';

@provider()
export class AjvValidator implements ValidatorInterface {
  protected ajv: Ajv;
  protected bindings: Map<any, ValidateFunction> = new Map();
  protected isSchemaSecure: ValidateFunction;

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
      allErrors: true, // for all errors for ajv errors plugin
    };

    this.ajv = new Ajv(ajvConfig);

    // activate ajv-keywords plugin
    ajvKeywords.default(this.ajv);
    addFormats.default(this.ajv);
    ajvErrors.default(this.ajv);

    this.isSchemaSecure = new Ajv({ strict: false }).compile(jsonSchemaSecureJson);
  }

  registerValidator(definition: { [k: string]: any }, target?: NewableType<any> | string): ValidatorInterface {
    return this.addSchema(definition, target);
  }

  registerCustomKeyword(def: {
    name?: string;
    type: string;
    definition: Format | KeywordDefinition;
  }): ValidatorInterface {
    const { name, type, definition } = def;
    switch (type) {
      case 'format':
        return this.addFormat(name, definition as Format);
      case 'keyword':
        return this.addKeyword(definition as KeywordDefinition);
      default:
        return this;
    }
  }

  protected validateSchema(schema: { [k: string]: any }): void {
    if (!this.ajv.validateSchema(schema)) {
      throw new Error(this.ajv.errorsText(this.ajv.errors));
    }

    if (!this.isSchemaSecure(schema)) {
      throw new Error(this.ajv.errorsText(this.isSchemaSecure.errors));
    }
  }

  protected addSchema(schema: { [k: string]: any }, target?: NewableType<any> | string): ValidatorInterface {
    try {
      this.validateSchema(schema);
      if (target) {
        const compiledSchema =
          typeof target === 'string'
            ? this.ajv.compile({
                $id: target,
                ...schema,
              })
            : this.ajv.compile(schema);
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
      console.error(`No schema provided for this type (${resolver})`);
      throw new Error(`No schema provided for this type (${resolver})`);
    }
    const validator = this.bindings.get(resolver);
    const valid = validator(data);

    if (!valid) throw new InvalidParamsException(this.mapErrors(validator.errors));

    return true;
  }

  protected mapErrors(errors: ErrorObject[]): string[] {
    if (!errors || !Array.isArray(errors)) return [];
    return errors.map((error) => `${error.instancePath}: ${error.message}`);
  }

  protected addFormat(name: string, format: Format): ValidatorInterface {
    this.ajv.addFormat(name, format);
    return this;
  }

  protected addKeyword(definition: KeywordDefinition): ValidatorInterface {
    this.ajv.addKeyword(definition);
    return this;
  }
}
