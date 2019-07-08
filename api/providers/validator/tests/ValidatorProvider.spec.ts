import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Parents, Container } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';

import { phoneFormatTest } from './parts/phoneFormatTest.spec';
import { bicFormatTest } from './parts/bicFormatTest.spec';
import { objectidFormatTest } from './parts/objectidFormatTest.spec';
import { coordinatesKeywordTest } from './parts/coordinatesKeywordTest.spec';
import { macroKeywordTest } from './parts/macroKeywordTest.spec';
import { ValidatorExtension } from '../src/ValidatorExtension';
import { ValidatorInterfaceResolver } from '../src';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

@Container.serviceProvider({
  env: null,
  config: {},
  validator: [],
})
class ServiceProvider extends Parents.ServiceProvider {
  extensions = [
    EnvExtension,
    ConfigExtension,
    ValidatorExtension,
  ]
}
let provider;

class FakeObject {
  constructor(data: object) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}

async function getProvider() {
  const serviceProvider = new ServiceProvider();
  await serviceProvider.register();
  await serviceProvider.init();
  return serviceProvider.getContainer().get(ValidatorInterfaceResolver);
}

describe('Json Schema provider', () => {
  beforeEach(async () => {
    provider = await getProvider();
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

  // check formats
  describe('Phone custom format', phoneFormatTest(getProvider, FakeObject));
  describe('BIC custom format', bicFormatTest(getProvider, FakeObject));
  describe('ObjectId custom format', objectidFormatTest(getProvider, FakeObject));
  // EU VAT
  // IBAN
  // INSEE
  // NAF
  // NIC
  // Postcode
  // SIREN
  // SIRET

  // check keywords
  describe('Coordinates keyword', coordinatesKeywordTest(getProvider, FakeObject));

  describe('Macro keyword', macroKeywordTest(getProvider, FakeObject));
});
