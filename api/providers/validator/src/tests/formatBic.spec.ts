import { schemaMacro, FakeObject } from './helpers/schemaMacro';

const { test, success, error } = schemaMacro();

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'myschema',
  type: 'object',
  properties: {
    bic: { macro: 'bic' },
  },
  required: ['bic'],
};

test('valid bic string short', success, [
  {
    schema,
    obj: FakeObject,
    data: { bic: 'ABNANL2A' },
  },
]);

test('valid bic string padding XXX', success, [
  {
    schema,
    obj: FakeObject,
    data: { bic: 'ABNANL2AXXX' },
  },
]);

test('too short', error, [
  {
    schema,
    obj: FakeObject,
    data: { bic: '012345' },
    expectations: { instanceOf: Error, message: new RegExp('should NOT be shorter than 8 characters') },
  },
]);

test('too long', error, [
  {
    schema,
    obj: FakeObject,
    data: { bic: '00331234567890' },
    expectations: { instanceOf: Error, message: new RegExp('should NOT be longer than 11 characters') },
  },
]);
