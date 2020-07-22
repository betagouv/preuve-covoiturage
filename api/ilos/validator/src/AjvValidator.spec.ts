import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { ConfigInterfaceResolver } from '@ilos/common';

import { AjvValidator } from './AjvValidator';

interface Context {
  sandbox: sinon.SinonSandbox;
  provider: AjvValidator;
}

const test = anyTest as TestInterface<Context>;

test.beforeEach((t) => {
  const fakeConfig = sinon.createStubInstance(ConfigInterfaceResolver, {
    get() {
      return {};
    },
  });

  t.context.provider = new AjvValidator(fakeConfig);
  t.context.provider.boot();
});

test.afterEach((t) => {
  sinon.restore();
});

class FakeObject {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}

test('Json Schema provider: should work', async (t) => {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema',
    type: 'object',
    properties: {
      hello: {
        type: 'string',
      },
    },
    required: ['hello'],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  const result = await t.context.provider.validate(new FakeObject({ hello: 'world' }));
  t.true(result);
});

test('Json Schema provider: should raise exception if data unvalid', async (t) => {
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema',
    type: 'object',
    properties: {
      hello: {
        type: 'string',
      },
    },
    required: ['hello'],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  const err = await t.throwsAsync(async () => t.context.provider.validate(new FakeObject({ hello: 1 })));
  t.is(
    err.message,
    '[{"keyword":"type","dataPath":".hello","schemaPath":"#/properties/hello/type","params":{"type":"string"},"message":"should be string"}]',
  );
});

test('Json Schema provider: should works with ref', async (t) => {
  const subSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema.world',
    type: 'object',
    properties: {
      world: {
        type: 'string',
      },
    },
    required: ['world'],
  };
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema',
    type: 'object',
    properties: {
      hello: {
        $ref: 'myschema.world',
      },
    },
    required: ['hello'],
  };
  t.context.provider.registerValidator(subSchema);
  t.context.provider.registerValidator(schema, FakeObject);
  const result = await t.context.provider.validate(new FakeObject({ hello: { world: '!!!' } }));
  t.true(result);
});

test('Json Schema provider: should work with inherance', async (t) => {
  class FakeObjectExtended extends FakeObject {}

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema',
    type: 'object',
    properties: {
      hello: {
        type: 'boolean',
      },
    },
    required: ['hello'],
  };

  const schemaExtended = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'myschema.extended',
    type: 'object',
    properties: {
      hello: {
        type: 'string',
      },
    },
    required: ['hello'],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  t.context.provider.registerValidator(schemaExtended, FakeObjectExtended);

  const resultExtended = await t.context.provider.validate(new FakeObjectExtended({ hello: 'world' }));
  t.true(resultExtended);
  const result = await t.context.provider.validate(new FakeObject({ hello: true }));
  t.true(result);
});
