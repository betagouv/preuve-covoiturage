import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { Providers } from '@pdc/core';

import { ValidatorProvider } from './ValidatorProvider';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

// tslint:disable prefer-type-cast
const fakeConfigProvider = <unknown>sinon.createStubInstance(Providers.ConfigProvider, {
  get() { return {}; },
}) as Providers.ConfigProvider;

let provider;

class FakeObject {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}

describe('Json Schema provider', () => {
  beforeEach(async () => {
    provider = new ValidatorProvider(fakeConfigProvider);
    await provider.boot();
  });

  it('should work', async () => {
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

    provider.addSchema(schema, FakeObject);
    const result = await provider.validate((new FakeObject({ hello: 'world' })));
    expect(result).to.equal(true);
  });

  it('should raise exception if data unvalid', () => {
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

    provider.addSchema(schema, FakeObject);
    return assert.isRejected(provider.validate((new FakeObject({ hello: 1 }))), 'data.hello should be string');
  });

  it('should works with ref', async () => {
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
    provider.addSchema(subSchema);
    provider.addSchema(schema, FakeObject);
    const result = await provider.validate((new FakeObject({ hello: { world: '!!!' } })));
    expect(result).to.equal(true);
  });

  it('should work with inherance', async () => {
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

    provider.addSchema(schema, FakeObject);
    provider.addSchema(schemaExtended, FakeObjectExtended);

    const resultExtended = await provider.validate(new FakeObjectExtended({ hello: 'world' }));
    expect(resultExtended).to.equal(true);
    const result = await provider.validate(new FakeObject({ hello: true }));
    expect(result).to.equal(true);
  });
});
