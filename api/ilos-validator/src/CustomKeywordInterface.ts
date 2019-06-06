import ajv from 'ajv';

export interface CustomKeywordInterface {
  name: string;
  type: string;
  definition: ajv.FormatValidator | ajv.FormatDefinition | ajv.KeywordDefinition;
}
