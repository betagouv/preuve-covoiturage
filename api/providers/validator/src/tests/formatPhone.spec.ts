import { schemaMacro, FakeObject } from './helpers/schemaMacro';

const { test, success, error } = schemaMacro();

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'myschema',
  type: 'object',
  properties: {
    phone: { macro: 'phone' },
  },
  required: ['phone'],
};

test('valid phone string int', success, [
  {
    schema,
    obj: FakeObject,
    data: { phone: '+33612345678' },
  },
]);

test('valid phone with leading 0', success, [
  {
    schema,
    obj: FakeObject,
    data: { phone: '0612345678' },
  },
]);

test('invalid phone too short', error, [
  {
    schema,
    obj: FakeObject,
    data: { phone: '061234' },
    expectations: { instanceOf: Error, message: new RegExp('should NOT be shorter than 10 characters') },
  },
]);

test('invalid phone too long', error, [
  {
    schema,
    obj: FakeObject,
    data: { phone: '061234567812345678' },
    expectations: { instanceOf: Error, message: new RegExp('keyword validation') },
  },
]);
