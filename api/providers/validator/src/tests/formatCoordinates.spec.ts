import { schemaMacro, FakeObject } from './helpers/schemaMacro';

const { test, success, error } = schemaMacro();

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'myschema',
  type: 'object',
  properties: {
    lon: {
      type: 'number',
      coordinates: 'lon',
    },
    lat: {
      type: 'number',
      coordinates: 'lat',
    },
  },
  required: ['lon'],
  dependencies: {
    lon: ['lat'],
  },
};

test('valid lon and lat integer', success, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 10, lat: 10 },
  },
]);

test('valid lon and lat decimals', success, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 1.12321373, lat: -45.1233312333333 },
  },
]);

test('out of bounds lon +', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 181, lat: 10 },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should pass \\\\"coordinates\\\\" keyword validation'),
    },
  },
]);

test('out of bounds lon -', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: -181, lat: 10 },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should pass \\\\"coordinates\\\\" keyword validation'),
    },
  },
]);

test('out of bounds lat +', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 123, lat: 91 },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should pass \\\\"coordinates\\\\" keyword validation'),
    },
  },
]);

test('out of bounds lat -', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 123, lat: -91 },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should pass \\\\"coordinates\\\\" keyword validation'),
    },
  },
]);

test('out of bounds lon and lat', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: 1000, lat: 1000 },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should pass \\\\"coordinates\\\\" keyword validation'),
    },
  },
]);

test('pass string instead of number', error, [
  {
    schema,
    obj: FakeObject,
    data: { lon: '1.23', lat: '2.123' },
    expectations: {
      instanceOf: Error,
      message: new RegExp('should be number'),
    },
  },
]);

test('invalid coordinates Lat schema config', async (t) => {
  t.throws(
    () =>
      t.context.provider.registerValidator(
        {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: 'myschema2',
          type: 'object',
          properties: {
            lat: {
              type: 'number',
              coordinates: 'wrong',
            },
          },
          required: ['lat'],
        },
        FakeObject,
      ),
    {
      instanceOf: Error,
      message: new RegExp('keyword schema is invalid: data should be equal to one of the allowed values'),
    },
  );
});

test('invalid coordinates lon schema config', async (t) => {
  t.throws(
    () =>
      t.context.provider.registerValidator(
        {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: 'myschema3',
          type: 'object',
          properties: {
            lon: {
              type: 'number',
              coordinates: 'wrong',
            },
          },
          required: ['lon'],
        },
        FakeObject,
      ),
    {
      instanceOf: Error,
      message: new RegExp('keyword schema is invalid: data should be equal to one of the allowed values'),
    },
  );
});
