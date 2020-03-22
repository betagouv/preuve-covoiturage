/**
 * Validator provider
 *
 * Test whether values are correctly validated by the AJV validator configured
 * in a Service Provider (inside the macro).
 *
 * Checks on normal schema, referenced schema and schema / object inheritance.
 */
import { schemaMacro, FakeObject } from './helpers/schemaMacro';

const { test, success, error } = schemaMacro();

/**
 * Regular schema testing against the FakeObject type
 */
test('hello world is fine', success, [
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema',
      type: 'object',
      properties: {
        hello: {
          type: 'string',
        },
      },
      required: ['hello'],
    },
    obj: FakeObject,
    data: { hello: 'world' },
  },
]);

/**
 * Invalid data throws an exception
 */
test('throws an exception on invalid data', error, [
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema',
      type: 'object',
      properties: {
        hello: {
          type: 'string',
        },
      },
      required: ['hello'],
    },
    obj: FakeObject,
    data: { hello: 1 },
    expectations: { instanceOf: Error },
  },
]);

/**
 * Register a schema referencing another schema and
 * validate a value against it
 */
test('works with ref', success, [
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema.world',
      type: 'object',
      properties: {
        world: {
          type: 'string',
        },
      },
      required: ['world'],
    },
  },
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema',
      type: 'object',
      properties: {
        hello: {
          $ref: 'myschema.world',
        },
      },
      required: ['hello'],
    },
    obj: FakeObject,
    data: { hello: { world: '!!!' } },
  },
]);

/**
 * Create an child class from FakeObject and
 * bind 2 different schemas to the classes
 */
class FakeObjectExtended extends FakeObject {}
test('works with inheritance', success, [
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema',
      type: 'object',
      properties: {
        hello: {
          type: 'boolean',
        },
      },
      required: ['hello'],
    },
    obj: FakeObject,
    data: { hello: true },
  },
  {
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      $id: 'myschema.extended',
      type: 'object',
      properties: {
        hello: {
          type: 'string',
        },
      },
      required: ['hello'],
    },
    obj: FakeObjectExtended,
    data: { hello: 'world' },
  },
]);
