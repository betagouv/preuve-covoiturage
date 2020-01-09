import { expect } from 'chai';
import { NewableType } from '@ilos/common';

import { ValidatorInterface } from '../../src';

export function coordinatesKeywordTest(getProvider, FakeObject: NewableType<any>): Function {
  return (): void => {
    let provider: ValidatorInterface;
    beforeEach(async () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema',
        type: 'object',
        properties: {
          lon: {
            type: 'number',
            coordinates: 'lon',
          },
          lat: {
            type: 'number',
            coordinates: 'lat',
          },
        },
        required: ['lon'],
        dependencies: {
          lon: ['lat'],
        },
      };
      provider = await getProvider();
      provider.registerValidator(schema, FakeObject);
    });

    it('valid lon and lat integer', async () => {
      const result = await provider.validate(new FakeObject({ lon: 10, lat: 10 }));
      expect(result).to.equal(true);
    });

    it('valid lon and lat decimals', async () => {
      const result = await provider.validate(new FakeObject({ lon: 1.12321373, lat: -45.1233312333333 }));
      expect(result).to.equal(true);
    });

    it('out of bounds lon', (done) => {
      provider
        .validate(new FakeObject({ lon: 181, lat: 10 }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lon should pass "coordinates" keyword validation');
        })
        .finally(done);
    });

    it('out of bounds lon', (done) => {
      provider
        .validate(new FakeObject({ lon: -181, lat: 10 }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lon should pass "coordinates" keyword validation');
        })
        .finally(done);
    });

    it('out of bounds lat', (done) => {
      provider
        .validate(new FakeObject({ lon: 123, lat: 91 }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lat should pass "coordinates" keyword validation');
        })
        .finally(done);
    });

    it('out of bounds lat', (done) => {
      provider
        .validate(new FakeObject({ lon: 123, lat: -91 }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lat should pass "coordinates" keyword validation');
        })
        .finally(done);
    });

    it('out of bounds lon and lat', (done) => {
      provider
        .validate(new FakeObject({ lon: 1000, lat: 1000 }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lon should pass "coordinates" keyword validation');
        })
        .finally(done);
    });

    it('pass string instead of number', (done) => {
      provider
        .validate(new FakeObject({ lon: '1.23', lat: '2.123' }))
        .catch((err: Error) => {
          expect(err.message).to.equal('data.lon should be number');
        })
        .finally(done);
    });

    it('invalid coordinates Lat schema config', async () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema2',
        type: 'object',
        properties: {
          lat: {
            type: 'number',
            coordinates: 'wrong',
          },
        },
        required: ['lon'],
        dependencies: {
          lon: ['lat'],
        },
      };
      try {
        provider.registerValidator(schema, FakeObject);
      } catch (e) {
        expect(e.message).to.equal('keyword schema is invalid: data should be equal to one of the allowed values');
      }
    });

    it('invalid coordinates Lon schema config', async () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'myschema3',
        type: 'object',
        properties: {
          lon: {
            type: 'number',
            coordinates: 'wrong',
          },
        },
        required: ['lon'],
        dependencies: {
          lon: ['lon'],
        },
      };
      try {
        provider.registerValidator(schema, FakeObject);
      } catch (e) {
        expect(e.message).to.equal('keyword schema is invalid: data should be equal to one of the allowed values');
      }
    });
  };
}
