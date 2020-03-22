import { schemaMacro, FakeObject } from './helpers/schemaMacro';

const { test, success, error } = schemaMacro();

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'myschema',
  type: 'object',
  properties: {
    rna: { macro: 'rna' },
  },
  required: ['rna'],
};

test('valid RNA', success, [
  {
    schema,
    obj: FakeObject,
    data: { rna: 'W802005251' },
  },
]);

test('too short', error, [
  {
    schema,
    obj: FakeObject,
    data: { rna: 'W12345' },
    expectations: { instanceOf: Error, message: new RegExp('should pass \\\\"macro\\\\" keyword validation') },
  },
]);

test('too long', error, [
  {
    schema,
    obj: FakeObject,
    data: { rna: 'W00331234567890' },
    expectations: { instanceOf: Error, message: new RegExp('should pass \\\\"macro\\\\" keyword validation') },
  },
]);
