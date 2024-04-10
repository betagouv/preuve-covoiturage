import { ConfigInterfaceResolver, RPCException } from '@ilos/common';
import anyTest, { TestFn } from 'ava';
import sinon from 'sinon';

import { AjvValidator } from './AjvValidator';

interface Context {
  sandbox: sinon.SinonSandbox;
  provider: AjvValidator;
}

const test = anyTest as TestFn<Context>;

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

test('should work', async (t) => {
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

test('should raise exception on invalid data', async (t) => {
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
  const err: RPCException = await t.throwsAsync(async () => t.context.provider.validate(new FakeObject({ hello: 1 })));
  t.is(err.message, 'Invalid params');
  t.is(err.rpcError.data[0], '/hello: must be string');
});

test('should work with ref', async (t) => {
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

test('should work with inheritance', async (t) => {
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
