import anyTest, { TestInterface } from 'ava';
import sinon, { SinonSpy } from 'sinon';
import { KernelInterfaceResolver, ConfigInterfaceResolver, ParamsType, ContextType, ResultType } from '@ilos/common';
import { ImportJourneyAction } from './ImportJourneyAction';
import { fields } from '../config/csv';

interface TestContext {
  kernelCallSpy: SinonSpy;
  action: ImportJourneyAction;
}

const test = anyTest as TestInterface<TestContext>;

const inputData = {
  journey_id: '1',
  operator_journey_id: '10',
  operator_class: 'C',
  passenger_identity_firstname: 'Jean',
  passenger_identity_lastname: 'Valjean',
  passenger_identity_email: 'jean.valjean@revolut.org',
  passenger_identity_phone: '+33601020304',
  passenger_identity_phone_trunc: '+336010203',
  passenger_identity_operator_user_id: '100',
  passenger_identity_company: 'Revolut inc.',
  passenger_identity_over_18: true,
  passenger_identity_travel_pass: 'mon_titre_de_transport_000',
  passenger_start_datetime: '2020-01-01T01:01:00Z',
  passenger_start_lat: 13.15,
  passenger_start_lon: 4.45,
  passenger_start_insee: '',
  passenger_start_country: 'France',
  passenger_start_literal: '5 rue du Paradis, 75010 Paris',
  passenger_end_datetime: '2020-01-01T02:01:00Z',
  passenger_end_lat: 13.14,
  passenger_end_lon: 5.45,
  passenger_end_insee: '44480',
  passenger_end_country: 'France',
  passenger_end_literal: '',
  passenger_seats: 2,
  passenger_contribution: 100,
  passenger_incentive_1_siret: '12345678900013',
  passenger_incentive_1_amount: 100,
  passenger_incentive_2_siret: '44455566600013',
  passenger_incentive_2_amount: 100,
  passenger_incentive_3_siret: '',
  passenger_incentive_3_amount: '',
  passenger_incentive_4_siret: '',
  passenger_incentive_4_amount: '',
  passenger_payment_1_type: 'payment',
  passenger_payment_1_siret: '98765432100013',
  passenger_payment_1_amount: 100,
  passenger_payment_2_type: '',
  passenger_payment_2_siret: '',
  passenger_payment_2_amount: '',
  passenger_payment_3_type: '',
  passenger_payment_3_siret: '',
  passenger_payment_3_amount: '',
  passenger_payment_4_type: '',
  passenger_payment_4_siret: '',
  passenger_payment_4_amount: '',
  passenger_distance: 10000,
  passenger_duration: 60000,
  driver_identity_firstname: 'Euphrasie',
  driver_identity_lastname: 'Tholomyès',
  driver_identity_email: 'et@thenardier.org',
  driver_identity_phone: '+33604030201',
  driver_identity_phone_trunc: '+336040302',
  driver_identity_operator_user_id: '1000',
  driver_identity_company: 'Thenardier org.',
  driver_identity_over_18: false,
  driver_identity_travel_pass: '',
  driver_start_datetime: '2020-01-03T04:05:00Z',
  driver_start_lat: 16.66,
  driver_start_lon: 7.77,
  driver_start_insee: '56805',
  driver_start_country: 'France',
  driver_start_literal: '5 rue Saint Lazare 75009 Paris',
  driver_end_datetime: '2020-01-03T05:05:00Z',
  driver_end_lat: 16.69,
  driver_end_lon: 7.78,
  driver_end_insee: '56784',
  driver_end_country: 'France',
  driver_end_literal: '10 rue Saint Lazare 75009 Pari',
  driver_revenue: 1000,
  driver_incentive_1_siret: '12345678900013',
  driver_incentive_1_amount: 100,
  driver_incentive_2_siret: '',
  driver_incentive_2_amount: '',
  driver_incentive_3_siret: '',
  driver_incentive_3_amount: '',
  driver_incentive_4_siret: '',
  driver_incentive_4_amount: '',
  driver_payment_1_type: 'payment',
  driver_payment_1_siret: '987654321000013',
  driver_payment_1_amount: 100,
  driver_payment_2_type: '',
  driver_payment_2_siret: '',
  driver_payment_2_amount: '',
  driver_payment_3_type: '',
  driver_payment_3_siret: '',
  driver_payment_3_amount: '',
  driver_payment_4_type: '',
  driver_payment_4_siret: '',
  driver_payment_4_amount: '',
  driver_distance: 10001,
  driver_duration: 60001,
};
const inputCsv = [...fields.keys()].map((k) => inputData[k]).join(';');

test.beforeEach((t) => {
  t.context.kernelCallSpy = sinon.spy();
  class Kernel extends KernelInterfaceResolver {
    async call(method: string, params: ParamsType, context: ContextType): Promise<ResultType> {
      return t.context.kernelCallSpy(method, params, context);
    }
  }
  class Config extends ConfigInterfaceResolver {
    get(key: string, fallback?: any): any {
      if (key === 'csv.fields') {
        return fields;
      }
      return fallback;
    }
  }
  t.context.action = new ImportJourneyAction(new Kernel(), new Config());
});

test('should be working', async (t) => {
  const result = {};
  const context = { call: { user: { operator_id: 9 } }, channel: { service: '' } };
  await t.context.action.call({ result, method: '', params: { data: [inputCsv, inputCsv].join('\n') }, context });
  t.true(t.context.kernelCallSpy.called);
  t.deepEqual(t.context.kernelCallSpy.getCall(0).args, [
    'acquisition:create',
    {
      journey_id: inputData.journey_id,
      operator_class: inputData.operator_class,
      operator_journey_id: inputData.operator_journey_id,
      driver: {
        distance: inputData.driver_distance,
        duration: inputData.driver_duration,
        start: {
          country: inputData.driver_start_country,
          literal: inputData.driver_start_literal,
          datetime: inputData.driver_start_datetime,
          lat: inputData.driver_start_lat,
          lon: inputData.driver_start_lon,
          insee: inputData.driver_start_insee,
        },
        end: {
          country: inputData.driver_end_country,
          literal: inputData.driver_end_literal,
          datetime: inputData.driver_end_datetime,
          lat: inputData.driver_end_lat,
          lon: inputData.driver_end_lon,
          insee: inputData.driver_end_insee,
        },
        identity: {
          firstname: inputData.driver_identity_firstname,
          lastname: inputData.driver_identity_lastname,
          email: inputData.driver_identity_email,
          phone: inputData.driver_identity_phone,
          phone_trunc: inputData.driver_identity_phone_trunc,
          company: inputData.driver_identity_company,
          operator_user_id: inputData.driver_identity_operator_user_id,
          over_18: inputData.driver_identity_over_18,
        },
        incentives: [
          {
            index: 1,
            amount: inputData.driver_incentive_1_amount,
            siret: inputData.driver_incentive_1_siret,
          },
        ],
        payments: [
          {
            index: 1,
            amount: inputData.driver_payment_1_amount,
            siret: inputData.driver_payment_1_siret,
            type: inputData.driver_payment_1_type,
          },
        ],
        revenue: inputData.driver_revenue,
      },
      passenger: {
        distance: inputData.passenger_distance,
        duration: inputData.passenger_duration,
        start: {
          country: inputData.passenger_start_country,
          literal: inputData.passenger_start_literal,
          datetime: inputData.passenger_start_datetime,
          lat: inputData.passenger_start_lat,
          lon: inputData.passenger_start_lon,
        },
        end: {
          country: inputData.passenger_end_country,
          datetime: inputData.passenger_end_datetime,
          lat: inputData.passenger_end_lat,
          lon: inputData.passenger_end_lon,
          insee: inputData.passenger_end_insee,
        },
        identity: {
          firstname: inputData.passenger_identity_firstname,
          lastname: inputData.passenger_identity_lastname,
          email: inputData.passenger_identity_email,
          phone: inputData.passenger_identity_phone,
          phone_trunc: inputData.passenger_identity_phone_trunc,
          company: inputData.passenger_identity_company,
          operator_user_id: inputData.passenger_identity_operator_user_id,
          over_18: inputData.passenger_identity_over_18,
          travel_pass: inputData.passenger_identity_travel_pass,
        },
        incentives: [
          {
            index: 1,
            amount: inputData.passenger_incentive_1_amount,
            siret: inputData.passenger_incentive_1_siret,
          },
          {
            index: 2,
            amount: inputData.passenger_incentive_2_amount,
            siret: inputData.passenger_incentive_2_siret,
          },
        ],
        payments: [
          {
            index: 1,
            amount: inputData.passenger_payment_1_amount,
            siret: inputData.passenger_payment_1_siret,
            type: inputData.passenger_payment_1_type,
          },
        ],
        seats: inputData.passenger_seats,
        contribution: inputData.passenger_contribution,
      },
    },
    context,
  ]);
});
