// tslint:disable: no-unused-expression

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { ServiceProvider as AbstractServiceProvider } from '@ilos/core';
import { serviceProvider, NewableType, ExtensionInterface } from '@ilos/common';

import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension, ValidatorInterfaceResolver } from '@pdc/provider-validator';

import { journeyCreateSchema } from './journeyCreateSchema';

chai.use(chaiAsPromised);
const { expect } = chai;

/**
 * Mock the Acquisition Service Provider
 */
@serviceProvider({
  validator: [['journey.create', journeyCreateSchema]],
})
class MockServiceProvider extends AbstractServiceProvider {
  readonly extensions: NewableType<ExtensionInterface>[] = [EnvExtension, ConfigExtension, ValidatorExtension];
}

let sp: MockServiceProvider;
let succeed: Function;
let fail: Function;

/**
 * Sugar function to run tests (succeed / fail)
 */
const expectFactory = (mockServiceProvider: MockServiceProvider, fulfilled = true) => async (
  schema: any,
  errorStatus?: string,
): Promise<void> => {
  let isValid: string | boolean;

  try {
    isValid = await mockServiceProvider
      .getContainer()
      .get<ValidatorInterfaceResolver>(ValidatorInterfaceResolver)
      .validate(schema, 'journey.create');
  } catch (e) {
    isValid = e.message;
  } finally {
    fulfilled
      ? expect(isValid).to.be.true
      : errorStatus
      ? expect(isValid).to.eq(errorStatus)
      : expect(isValid).to.be.an.instanceof(String);
  }
};

describe('Journey Create Schema', () => {
  before(async () => {
    sp = new MockServiceProvider();
    succeed = expectFactory(sp, true);
    fail = expectFactory(sp, false);
    await sp.register();
    await sp.init();
  });

  describe('Required fields', () => {
    it('Fails on missing journey_id', async () => {
      await fail(
        {},
        "data should have required property 'journey_id', data should be array, data should match exactly one schema in oneOf",
      );
    });

    it('Fails on missing operator_class', async () => {
      await fail(
        { journey_id: '1234', operator_id: '5d148b878ddca84ffe6535cd' },
        "data should have required property 'operator_class', data should be array, data should match exactly one schema in oneOf",
      );
    });

    it('Fails on missing operator_id', async () => {
      await fail(
        { journey_id: '1234', operator_class: 'A' },
        "data should have required property '.passenger', data should have required property '.driver', data should match some schema in anyOf, data should be array, data should match exactly one schema in oneOf",
      );
    });

    it('Fails on unsupported operator_class', async () => {
      await fail(
        { journey_id: '1234', operator_id: '5d148b878ddca84ffe6535cd', operator_class: 'Z' },
        'data.operator_class should be equal to one of the allowed values, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on no passenger, no driver', async () => {
      await fail(
        { journey_id: '1234', operator_class: 'A', operator_id: '5d148b878ddca84ffe6535cd' },
        "data should have required property '.passenger', data should have required property '.driver', data should match some schema in anyOf, data should be array, data should match exactly one schema in oneOf",
      );
    });
  });

  describe('Array of journeys', () => {
    it('Succeeds on array with passenger only', async () => {
      await succeed([
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        {
          journey_id: '4321',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
      ]);
    });

    it('Fails on valid and invalid journeys together', async () => {
      await fail(
        [
          {
            journey_id: '1234',
            operator_class: 'A',
            operator_id: '5d148b878ddca84ffe6535cd',
            passenger: {
              identity: { phone: '+33612345678' },
              start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
              end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
              contribution: 0,
              incentives: [],
            },
          },
          {
            journey_id: '4321',
            operator_class: 'A',
            operator_id: '5d148b878ddca84ffe6535cd',
          },
        ],
        "data should be object, data[1] should have required property '.passenger', data[1] should have required property '.driver', data[1] should match some schema in anyOf, data should match exactly one schema in oneOf",
      );
    });
  });

  describe('Passenger and driver', () => {
    it('Succeeds on passenger only', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on driver only', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        driver: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          revenue: 0,
          incentives: [],
        },
      });
    });

    it('Fails on null passenger', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: null,
          driver: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            revenue: 0,
            incentives: [],
          },
        },
        'data.passenger should be object, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on null driver', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          driver: null,
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.driver should be object, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Succeeds on passenger and driver', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
        driver: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          revenue: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on over_18 true', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678', over_18: true },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on over_18 false', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678', over_18: false },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on over_18 null', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678', over_18: null },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on missing over_18 (defaults to null)', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678', over_18: undefined },
          start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Fails on over_18 truthy/falsy values', async () => {
      for await (const value of [1, 'TRUE', 'oui', 'yes', 'on', 'checked', 0, 'False', 'non', '']) {
        await fail(
          {
            journey_id: '1234',
            operator_class: 'A',
            operator_id: '5d148b878ddca84ffe6535cd',
            passenger: {
              identity: { phone: '+33612345678', over_18: value },
              start: { datetime: '2019-01-01T10:00:00Z', literal: "Saint-Sulpice-d'Excideuil" },
              end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
              contribution: 0,
              incentives: [],
            },
          },
          'data.passenger.identity.over_18 should be equal to one of the allowed values, data should be array, data should match exactly one schema in oneOf',
        );
      }
    });
  });

  describe('Position', () => {
    it('Fails on empty', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: {},
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on missing required datetime (1 property)', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { literal: 'Saint-Yrieix-la-Perche' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on missing required datetime (2 properties)', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { literal: 'Saint-Yrieix-la-Perche' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle", country: 'France' },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Succeeds on lat/lon only', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', lon: 5, lat: 5 },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Fails on missing lat', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', lon: 5 },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should have property lat when property lon is present, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on missing lon', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', lat: 5 },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should have property lon when property lat is present, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Succeeds on insee only', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', insee: '75101' },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Succeeds on literal only', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: 'Saint-Jory-las-Bloux' },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Fails on country only', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', country: 'Mozambique' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.start should have property literal when property country is present, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Succeeds on all', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: {
            datetime: '2019-01-01T10:00:00Z',
            lon: 5,
            lat: 5,
            insee: '2A123',
            literal: 'Jumilhac-le-Grand',
            country: 'Mozambique',
          },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });
  });

  describe('Incentives', () => {
    it('Fails on missing', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
          },
        },
        "data.passenger should have required property 'incentives', data should be array, data should match exactly one schema in oneOf",
      );
    });

    it('Succeeds on empty []', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [],
        },
      });
    });

    it('Fails on missing properties (all required) - 1 item', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [
              {
                index: 0,
                amount: 1,
              },
            ],
          },
        },
        'data.passenger.incentives[0] should NOT have fewer than 3 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails on missing properties (all required) - 2 items', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [
              {
                index: 0,
                amount: 1,
                siret: '11000101300066',
              },
              {
                index: 1,
                amount: 1,
              },
            ],
          },
        },
        'data.passenger.incentives[1] should NOT have fewer than 3 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Succeeds on all', async () => {
      await succeed({
        journey_id: '1234',
        operator_class: 'A',
        operator_id: '5d148b878ddca84ffe6535cd',
        passenger: {
          identity: { phone: '+33612345678' },
          start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
          end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
          contribution: 0,
          incentives: [
            {
              index: 0,
              amount: 1,
              siret: '11000101300066',
            },
          ],
        },
      });
    });

    it('Fails on index not being an integer', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: { phone: '+33612345678' },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [
              {
                index: 1.2,
                amount: 1,
                siret: '11000101300066',
              },
            ],
          },
        },
        'data.passenger.incentives[0].index should be integer, data should be array, data should match exactly one schema in oneOf',
      );
    });
  });

  describe('Travel pass', () => {
    it('Fails if missing any prop - 0 items', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: {
              phone: '+33612345678',
              travel_pass: {},
            },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails if missing any prop - 1 item', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: {
              phone: '+33612345678',
              travel_pass: {
                name: 'sodexo',
              },
            },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });

    it('Fails if missing any prop - 1 item', async () => {
      await fail(
        {
          journey_id: '1234',
          operator_class: 'A',
          operator_id: '5d148b878ddca84ffe6535cd',
          passenger: {
            identity: {
              phone: '+33612345678',
              travel_pass: {
                user_id: '1230812983',
              },
            },
            start: { datetime: '2019-01-01T10:00:00Z', literal: 'Jumilhac-le-Grand' },
            end: { datetime: '2019-01-01T11:00:00Z', literal: "Corgnac-sur-l'Isle" },
            contribution: 0,
            incentives: [],
          },
        },
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties, data should be array, data should match exactly one schema in oneOf',
      );
    });
  });
});
