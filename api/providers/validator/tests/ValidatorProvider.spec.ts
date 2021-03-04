import anyTest, { TestInterface, ExecutionContext } from 'ava';

import { ServiceProvider as BaseServiceProvider } from '@ilos/core';
import { serviceProvider } from '@ilos/common';
import { Extensions } from '@ilos/core';

import { ValidatorExtension } from '../src/ValidatorExtension';
import { ValidatorInterfaceResolver } from '../src';
import { ValidationError } from 'ajv';

interface TestContext {
  provider: ValidatorInterfaceResolver;
}

const test = anyTest as TestInterface<TestContext>;

test.beforeEach(async (t) => {
  @serviceProvider({
    env: null,
    config: {},
    validator: [],
  })
  class ServiceProvider extends BaseServiceProvider {
    extensions = [Extensions.Config, ValidatorExtension];
  }

  const sp = new ServiceProvider();
  await sp.register();
  await sp.init();

  t.context.provider = sp.getContainer().get(ValidatorInterfaceResolver);
});

async function macro(
  t: ExecutionContext<TestContext>,
  input: { [k: string]: any },
  result: boolean | string,
  schema: { [k: string]: any },
  ...extraSchemas: { [k: string]: any }[]
) {
  for (const extraSchema of extraSchemas) {
    t.context.provider.registerValidator(extraSchema);
  }
  t.context.provider.registerValidator(schema, 'target');
  if (typeof result === 'string') {
    await t.throwsAsync(t.context.provider.validate(input), { instanceOf: ValidationError }, result);
  } else {
    t.is(await t.context.provider.validate(input), result);
  }
}

test('should work', macro, { hello: 'world' }, true, {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'myschema',
  type: 'object',
  properties: {
    hello: {
      type: 'string',
    },
  },
  required: ['hello'],
});
test(
  'should raise exception if data is invalid',
  macro,
  { hello: 1 },
  '[{"keyword":"type","dataPath":".hello","schemaPath":"#/properties/hello/type","params":{"type":"string"},"message":"should be string"}]', // eslint-disable-line max-len
  {
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
);

test(
  'should works with ref',
  macro,
  { hello: { world: '!!!' } },
  true,
  {
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
  {
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
);
