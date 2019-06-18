import { expect } from 'chai';
import { NewableType } from '@ilos/core/dist/types';

import { ValidatorProvider } from '../../src/ValidatorProvider';

export function macroKeywordTest(fakeConfigProvider, FakeObject: NewableType<any>) {
  return () => {
    let provider;

    beforeEach(async () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema',
        type: 'object',
        minProperties: 1,
        properties: {
          lon: { macro: 'lon' },
          firstname: { macro: 'varchar' },
        },
      };

      provider = new ValidatorProvider(fakeConfigProvider);
      await provider.boot();

      provider.addSchema(schema, FakeObject);
    });

    it('valid lon integer', async () => {
      const result = await provider.validate(new FakeObject({ lon: 180 }));
      expect(result).to.equal(true);
    });

    it('valid firstname integer', async () => {
      const result = await provider.validate(new FakeObject({ firstname: 'abc' }));
      expect(result).to.equal(true);
    });

    // it('out of bounds lon', (done) => {
    //   provider
    //     .validate(new FakeObject({ lon: 181, lat: 10 }))
    //     .catch((err: Error) => {
    //       expect(err.message).to.equal('data.lon should pass "coordinates" keyword validation');
    //     })
    //     .finally(done);
    // });
  };
}
