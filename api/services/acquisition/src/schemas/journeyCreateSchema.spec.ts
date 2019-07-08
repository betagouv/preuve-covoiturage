// tslint:disable: no-unused-expression

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { Parents, Interfaces, Container } from '@ilos/core';
import { ConfigExtension } from '@ilos/config';
import { EnvExtension } from '@ilos/env';
import { ValidatorExtension, ValidatorInterfaceResolver } from '@pdc/provider-validator';

import { journeyCreateSchema } from './journeyCreateSchema';

chai.use(chaiAsPromised);
const { expect } = chai;

/**
 * Mock the Acquisition Service Provider
 */
@Container.serviceProvider({
  env: null,
  config: {},
  validator: [
    ['journey.create', journeyCreateSchema],
  ],
})
class MockServiceProvider extends Parents.ServiceProvider {
  readonly extensions: Interfaces.ExtensionStaticInterface[] = [
    EnvExtension,
    ConfigExtension,
    ValidatorExtension,
  ];
}

let sp: MockServiceProvider;
let succeed: Function;
let fail: Function;

/**
 * Sugar function to run tests (succeed / fail)
 */
const expectFactory = (s: MockServiceProvider, fulfilled = true) => (schema: any, errorStatus?: string) =>
  fulfilled
    ? expect(s.getContainer().get(ValidatorInterfaceResolver).validate(schema, 'journey.create')).to.be.fulfilled
    : errorStatus
    ? expect(s.getContainer().get(ValidatorInterfaceResolver).validate(schema, 'journey.create')).to.be.rejectedWith(errorStatus)
    : expect(s.getContainer().get(ValidatorInterfaceResolver).validate(schema, 'journey.create')).to.be.rejected;

describe('Journey Create Schema : ', () => {
  before(async () => {
    sp = new MockServiceProvider();
    succeed = expectFactory(sp, true);
    fail = expectFactory(sp, false);
    await sp.register();
    await sp.init();
  });
  describe('Required fields', () => {
    it('Fails on missing journey_id', () => {
      fail({}, "data should have required property '.journey_id'");
    });
  
    it('Fails on missing operator_class', () => {
      fail({ journey_id: '1234', operator_id: 'A' }, "data should have required property 'operator_class'");
    });
  
    it('Fails on missing operator_id', () => {
      fail({ journey_id: '1234', operator_class: 'A' }, "data should have required property '.operator_id'");
    });
  
    it('Fails on unsupported operator_class', () => {
      fail(
        { journey_id: '1234', operator_id: 'A', operator_class: 'Z' },
        'data.operator_class should be equal to one of the allowed values',
      );
    });
  
    it('Fails on no passenger, no driver', () => {
      fail(
        { journey_id: '1234', operator_class: 'A', operator_id: '5d148b878ddca84ffe6535cd' },
        "data should have required property '.passenger', data should have required property '.driver', data should match some schema in anyOf",
      );
    });
  });
  
  describe('Passenger and driver', () => {
    it('Succeeds on passenger only', () => {
      succeed({
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
  
    it('Succeeds on driver only', () => {
      succeed({
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
  
    it('Fails on null passenger', () => {
      fail(
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
        'data.passenger should be object',
      );
    });
  
    it('Fails on null driver', () => {
      fail(
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
        'data.driver should be object',
      );
    });
  
    it('Succeeds on passenger and driver', () => {
      succeed({
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
  
    it('Succeeds on over_18 true', () => {
      succeed({
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
  
    it('Succeeds on over_18 false', () => {
      succeed({
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
  
    it('Succeeds on over_18 null', () => {
      succeed({
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
  
    it('Succeeds on missing over_18 (defaults to null)', () => {
      succeed({
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
  
    it('Fails on over_18 truthy/falsy values', () => {
      [1, 'TRUE', 'oui', 'yes', 'on', 'checked', 0, 'False', 'non', ''].forEach((value) => {
        fail(
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
          'data.passenger.identity.over_18 should be equal to one of the allowed values',
        );
      });
    });
  });
  
  describe('Position', () => {
    it('Fails on empty', () => {
      fail(
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
        'data.passenger.start should NOT have fewer than 2 properties',
      );
    });
  
    it('Fails on missing required datetime (1 property)', () => {
      fail(
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
        'data.passenger.start should NOT have fewer than 2 properties',
      );
    });
  
    it('Fails on missing required datetime (2 properties)', () => {
      fail(
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
        'data.passenger.start should NOT have fewer than 2 properties',
      );
    });
  
    it('Succeeds on lat/lon only', () => {
      succeed({
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
  
    it('Fails on missing lat', () => {
      fail(
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
        'data.passenger.start should have property lat when property lon is present',
      );
    });
  
    it('Fails on missing lon', () => {
      fail(
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
        'data.passenger.start should have property lon when property lat is present',
      );
    });
  
    it('Succeeds on insee only', () => {
      succeed({
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
  
    it('Succeeds on literal only', () => {
      succeed({
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
  
    it('Fails on country only', () => {
      fail(
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
        'data.passenger.start should have property literal when property country is present',
      );
    });
  
    it('Succeeds on all', () => {
      succeed({
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
    it('Fails on missing', () => {
      fail(
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
        "data.passenger should have required property 'incentives'",
      );
    });
  
    it('Succeeds on empty []', () => {
      succeed({
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
  
    it('Fails on missing properties (all required) - 1 item', () => {
      fail(
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
        'data.passenger.incentives[0] should NOT have fewer than 3 properties',
      );
    });
  
    it('Fails on missing properties (all required) - 2 items', () => {
      fail(
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
        'data.passenger.incentives[1] should NOT have fewer than 3 properties',
      );
    });
  
    it('Succeeds on all', () => {
      succeed({
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
  
    it('Fails on index not being an integer', () => {
      fail(
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
        'data.passenger.incentives[0].index should be integer',
      );
    });
  });
  
  describe('Travel pass', () => {
    it('Fails if missing any prop - 0 items', () => {
      fail(
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
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties',
      );
    });
  
    it('Fails if missing any prop - 1 item', () => {
      fail(
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
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties',
      );
    });
  
    it('Fails if missing any prop - 1 item', () => {
      fail(
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
        'data.passenger.identity.travel_pass should NOT have fewer than 2 properties',
      );
    });
  });  
});
