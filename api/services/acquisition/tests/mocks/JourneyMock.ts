import { JSONSchema7Type } from 'json-schema';

interface JsonSchemaFakerInterface {
  resolve(schema: JSONSchema7Type): Promise<object>;
  generate(schema: JSONSchema7Type): object;
}

export class JourneyMock {
  constructor(protected jsonSchemaFaker: JsonSchemaFakerInterface, protected schema: JSONSchema7Type) {}

  async generate(schema: JSONSchema7Type = null) {
    return this.jsonSchemaFaker.resolve(schema || this.schema);
  }
}
