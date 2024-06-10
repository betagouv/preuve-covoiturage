import {
  addFormats,
  Ajv,
  ajvErrors,
  ajvKeywords,
  ErrorObject,
  Format,
  jsonSchemaSecureJson,
  KeywordDefinition,
  ValidateFunction,
} from "@/deps.ts";
import {
  ConfigInterfaceResolver,
  InvalidParamsException,
  NewableType,
  provider,
  ValidatorInterface,
} from "@/ilos/common/index.ts";
import { uuid } from "@/pdc/providers/test/helpers.ts";

@provider()
export class AjvValidator implements ValidatorInterface {
  protected ajv: Ajv | null = null;
  protected bindings: Map<any, ValidateFunction> = new Map();
  protected isSchemaSecure: ValidateFunction | null = null;

  constructor(protected config: ConfigInterfaceResolver) {}

  boot() {
    const ajvConfig = {
      strict: false,
      $data: true,
      logger: console,
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

    this.isSchemaSecure = new Ajv({ strict: false }).compile(
      jsonSchemaSecureJson,
    );
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

    if (this.isSchemaSecure && !this.isSchemaSecure(schema)) {
      throw new Error(this.ajv.errorsText(this.isSchemaSecure?.errors));
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
      console.error(
        `Error during adding validator ${schema.$id} | ${target} | ${e.message}`,
      );
      console.error(e.message, e);
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

  async validate(data: any, schema?: string): Promise<boolean> {
    const resolver = schema ? schema : data.constructor;

    if (!this.bindings.has(resolver)) {
      console.error(`No schema provided for this type (${resolver})`);
      throw new Error(`No schema provided for this type (${resolver})`);
    }
    const validator = this.bindings.get(resolver);
    const valid = validator && validator(data);

    if (!valid) {
      if (!validator || !validator?.errors) {
        throw new Error("No validator found");
      }

      throw new InvalidParamsException(this.mapErrors(validator.errors));
    }

    return true;
  }
}
