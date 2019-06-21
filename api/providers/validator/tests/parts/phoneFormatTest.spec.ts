import { expect } from 'chai';
import { NewableType } from '@ilos/core/dist/types';

import { ValidatorProvider } from '../../src/ValidatorProvider';

export function phoneFormatTest(fakeConfigProvider, FakeObject: NewableType<any>) {
  return () => {
    let provider;

    beforeEach(async () => {
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

      provider = new ValidatorProvider(fakeConfigProvider);
      await provider.boot();

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
      provider.validate(new FakeObject({ phone: '012345' })).catch((err: Error) => {
        expect(err.message).to.equal('data.phone should NOT be shorter than 10 characters');
        done();
      });
    });

    it('too long', (done) => {
      provider
        .validate(new FakeObject({ phone: '00331234567890' }))
        .then(done)
        .catch((err: Error) => {
          expect(err.message).to.equal('data.phone should match format "phone"');
          done();
        });
    });
  };
}
