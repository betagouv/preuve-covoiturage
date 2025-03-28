import {
  ConfigInterfaceResolver,
  InvalidParamsException,
  NewableType,
  provider,
  ValidatorInterface,
} from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { uuid } from "@/pdc/providers/test/helpers.ts";
import { Ajv, ErrorObject, Format, KeywordDefinition, ValidateFunction } from "dep:ajv";
import ajvErrors from "dep:ajverrors";
import addFormats from "dep:ajvformats";
import ajvKeywords from "dep:ajvkeywords";

@provider()
export class AjvValidator implements ValidatorInterface {
  protected ajv: Ajv | null = null;
  protected bindings: Map<any, ValidateFunction> = new Map();
  protected validationErrors: ErrorObject[] = [];

  get errors(): ErrorObject[] {
    return this.validationErrors || [];
  }

  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const ajvConfig = {
      strict: false,
      $data: true,
      logger,
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: false,
      ...this.config.get("ajv.config", {}),
      allErrors: true, // for all errors for ajv errors plugin
    };

    this.ajv = new Ajv(ajvConfig);

    // activate ajv-keywords plugin
    ajvKeywords.default(this.ajv);
    addFormats.default(this.ajv);
    ajvErrors.default(this.ajv);
  }

  registerValidator(
    definition: { [k: string]: any },
    target?: NewableType<any> | string,
  ): ValidatorInterface {
    return this.addSchema(definition, target);
  }

  registerCustomKeyword(def: {
    name?: string;
    type: string;
    definition: Format | KeywordDefinition;
  }): ValidatorInterface {
    const { name, type, definition } = def;
    switch (type) {
      case "format": {
        // generate a unique name if not provided
        const n = name || `${type}:${uuid()}`;
        return this.addFormat(n, definition as Format);
      }
      case "keyword":
        return this.addKeyword(definition as KeywordDefinition);
      default:
        return this;
    }
  }

  protected validateSchema(schema: { [k: string]: any }): void {
    if (!this.ajv?.validateSchema(schema)) {
      throw new Error(this.ajv?.errorsText(this.ajv.errors));
    }
  }

  protected addSchema(
    schema: { [k: string]: any },
    target?: NewableType<any> | string,
  ): ValidatorInterface {
    try {
      this.validateSchema(schema);
      if (target) {
        const isString = typeof target === "string";
        const compiledSchema = this.ajv?.compile(
          isString ? { $id: target, ...schema } : schema,
        );
        compiledSchema && this.bindings.set(target, compiledSchema);
      } else {
        this.ajv?.addSchema(schema);
      }
      return this;
    } catch (e) {
      logger.error(
        `Error during adding validator ${schema.$id} | ${target} | ${e.message}`,
      );
      logger.error(e.message, e);
      throw e;
    }
  }

  protected addFormat(name: string, format: Format): ValidatorInterface {
    this.ajv?.addFormat(name, format);
    return this;
  }

  protected addKeyword(definition: KeywordDefinition): ValidatorInterface {
    this.ajv?.addKeyword(definition);
    return this;
  }

  protected mapErrors(errors: ErrorObject[]): string[] {
    if (!errors || !Array.isArray(errors)) return [];
    return errors.map((error) => `${error.instancePath}: ${error.message}`);
  }

  async validate(data: object, schema?: string): Promise<boolean> {
    const resolver = schema ? schema : data.constructor;

    if (!this.bindings.has(resolver)) {
      logger.error(`No schema provided for this type (${resolver})`);
      throw new Error(`No schema provided for this type (${resolver})`);
    }
    const validator = this.bindings.get(resolver);
    const valid = validator && validator(data);

    if (!valid) {
      if (!validator || !validator?.errors) {
        throw new Error("No validator found");
      }

      this.validationErrors = [...validator.errors];

      throw new InvalidParamsException(this.mapErrors(validator.errors));
    }

    return true;
  }
}
