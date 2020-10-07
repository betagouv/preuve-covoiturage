// tslint:disable: no-unused-expression
import { Suite } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { NewableType } from '@ilos/common';

import { ValidatorInterface } from '../../src';

chai.use(chaiAsPromised);
const { expect } = chai;

export function rnaFormatTest(getProvider, FakeObject: NewableType<any>): (this: Suite) => void {
  let provider: ValidatorInterface;

  return function (): void {
    before(
      async (): Promise<void> => {
        const schema = {
          $schema: 'http://json-schema.org/draft-07/schema#',
          $id: 'myschema',
          type: 'object',
          properties: {
            rna: { macro: 'rna' },
          },
          required: ['rna'],
        };
        provider = await getProvider();
        provider.registerValidator(schema, FakeObject);
      },
    );

    it('valid RNA', async (): Promise<void> => {
      const result = await provider.validate(new FakeObject({ rna: 'W802005251' }));
      expect(result).to.equal(true);
    });

    it('too short', async (): Promise<void> => {
      expect(provider.validate(new FakeObject({ rna: 'W12345' }))).to.be.rejected;
    });

    it('too long', async (): Promise<void> => {
      expect(provider.validate(new FakeObject({ rna: 'W00331234567890' }))).to.be.rejected;
    });
  };
}
