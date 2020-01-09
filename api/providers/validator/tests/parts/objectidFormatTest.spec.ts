import { expect } from 'chai';
import { NewableType } from '@ilos/common';

import { ValidatorInterface } from '../../src';

export function objectidFormatTest(getProvider, FakeObject: NewableType<any>): Function {
  let provider: ValidatorInterface;
  return (): void => {
    before(async () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema',
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            format: 'objectid',
            minLength: 24,
            maxLength: 24,
          },
        },
        required: ['_id'],
      };
      provider = await getProvider();
      provider.registerValidator(schema, FakeObject);
    });

    it('valid ObjectId', async () => {
      const result = await provider.validate(new FakeObject({ _id: '5d07eabd57ce4d70ae6a8508' }));
      expect(result).to.equal(true);
    });

    it('valid ObjectId uppercase', async () => {
      const result = await provider.validate(new FakeObject({ _id: '5d07eb19990207328440c338'.toUpperCase() }));
      expect(result).to.equal(true);
    });

    it('too short', (done) => {
      provider
        .validate(new FakeObject({ _id: '5d07eb199902' }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data._id should NOT be shorter than 24 characters');
        })
        .finally(done);
    });

    it('too long', (done) => {
      provider
        .validate(new FakeObject({ _id: '5d07eabd57ce4d70ae6a8508d57ce4d7' }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data._id should NOT be longer than 24 characters');
        })
        .finally(done);
    });

    it('wrong chars', (done) => {
      provider
        .validate(new FakeObject({ _id: '5d07eb1-.^0207328440c338' }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data._id should match format "objectid"');
        })
        .finally(done);
    });
  };
}
