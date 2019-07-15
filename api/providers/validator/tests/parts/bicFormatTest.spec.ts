import { expect } from 'chai';
import { NewableType } from '@ilos/common';

import { ValidatorInterface } from '../../src';

export function bicFormatTest(getProvider, FakeObject: NewableType<any>) {
  let provider: ValidatorInterface;

  return () => {
    before(async () => {
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
      provider = await getProvider();
      provider.registerValidator(schema, FakeObject);
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
  };
}
