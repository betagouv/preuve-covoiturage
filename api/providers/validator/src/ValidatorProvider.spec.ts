import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { ValidatorProvider } from './ValidatorProvider';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

// tslint:disable prefer-type-cast
const fakeConfigProvider = sinon.createStubInstance(ConfigProviderInterfaceResolver, {
  get() {
    return {};
  },
});

let provider;

class FakeObject {
  constructor(data: object) {
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
    const result = await provider.validate(new FakeObject({ hello: 'world' }));
    expect(result).to.equal(true);
  });

  it('should raise exception if data is invalid', () => {
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
    return assert.isRejected(provider.validate(new FakeObject({ hello: 1 })), 'data.hello should be string');
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
    const result = await provider.validate(new FakeObject({ hello: { world: '!!!' } }));
    expect(result).to.equal(true);
  });

  it('should work with inheritance', async () => {
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

  describe('Phone custom format', () => {
    beforeEach(() => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema',
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            format: 'phone',
            minLength: 10,
            maxLength: 14,
          },
        },
        required: ['phone'],
      };

      provider.addSchema(schema, FakeObject);
    });

    it('valid phone string intl', async () => {
      const result = await provider.validate(new FakeObject({ phone: '+33612345678' }));
      expect(result).to.equal(true);
    });

    it('valid phone string leading 0', async () => {
      const result = await provider.validate(new FakeObject({ phone: '0612345678' }));
      expect(result).to.equal(true);
    });

    it('too short', (done) => {
      provider
        .validate(new FakeObject({ phone: '012345' }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.phone should NOT be shorter than 10 characters');
        })
        .finally(done);
    });

    it('too long', (done) => {
      provider
        .validate(new FakeObject({ phone: '00331234567890' }))
        .catch((err: Error) => {
          // console.log(err.message);
          expect(err.message).to.equal('data.phone should match format "phone"');
        })
        .finally(done);
    });
  });

  describe('BIC custom format', () => {
    beforeEach(() => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema',
        type: 'object',
        properties: {
          bic: {
            type: 'string',
            format: 'bic',
            minLength: 8,
            maxLength: 11,
          },
        },
        required: ['bic'],
      };

      provider.addSchema(schema, FakeObject);
    });

    it('valid bic string short', async () => {
      const result = await provider.validate(new FakeObject({ bic: 'ABNANL2A' }));
      expect(result).to.equal(true);
    });

    it('valid bic string padding XXX', async () => {
      const result = await provider.validate(new FakeObject({ bic: 'ABNANL2AXXX' }));
      expect(result).to.equal(true);
    });

    it('too short', (done) => {
      provider
        .validate(new FakeObject({ bic: '012345' }))
        .catch((err: Error) => {
          // console.log(err.message);
          expect(err.message).to.equal('data.bic should NOT be shorter than 8 characters');
        })
        .finally(done);
    });

    it('too long', (done) => {
      provider
        .validate(new FakeObject({ bic: '00331234567890' }))
        .catch((err: Error) => {
          // console.log(err.message);
          expect(err.message).to.equal('data.bic should NOT be longer than 11 characters');
        })
        .finally(done);
    });
  });
});
