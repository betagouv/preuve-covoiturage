import { describe } from 'mocha';
import { expect } from 'chai';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { PartialGeoInterface, GeoInterface } from '@pdc/provider-geo/dist/interfaces';

import { NormalizationCostAction } from './NormalizationCostAction';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/cost.contract';

class MockedNormalizationCostAction extends NormalizationCostAction {
  constructor() {
    super(null);
  }
  protected async getSiret(operatorId): Promise<string> {
    return '53996626700012';
  }
}

function testPayments(params: ParamsInterface, result: ResultInterface, userType: string) {
  console.log(
    'params.payments.length : ',
    result.payments.length,
    params.payments.length + params.incentives.length + 1,
  );

  expect(result.payments.length).to.be.eq(
    params.payments.length + params.incentives.length + 1,
    `Resulted payments should be a concatenation of data incentives, contributions and a final calculated payments`,
  );

  const lastPayment = result.payments.pop();

  console.log('result.payments : ', result.payments);

  expect(result.payments[0].type).to.be.eq('incentive', `First resulted payment should an actual payment`);
  expect(result.payments[1].type).to.be.eq('payment', `First resulted payment should an incentive`);

  expect(lastPayment.amount).to.be.eq(
    Math.abs(result.cost) - result.payments.reduce((sum, item) => sum + item.amount, 0),
    'Last payment should match resulted cost and payments (payment + incentives)',
  );
}

describe('Cost normalization', async () => {
  const action = new MockedNormalizationCostAction();
  it('Driver should', async () => {
    // driver
    const driverData = {
      operator_id: 1,
      revenue: 20,
      // contribution: 3,
      incentives: [
        {
          index: 0,
          siret: '53996626700012',
          amount: 10,
        },
      ],
      payments: [
        {
          index: 0,
          siret: '53996626700012',
          amount: 5,
          type: 'sodexo',
        },
      ],
      isDriver: true,
    };

    const driverResult = await action.handle(driverData);

    expect(driverResult.cost).to.be.eq(
      -driverData.revenue - driverData.incentives[0].amount,
      'cost match with driver revenue and incentives',
    );

    testPayments(driverData, driverResult, 'driver');
  });

  it('Passenger should', async () => {
    const action = new MockedNormalizationCostAction();

    const passengerData = {
      operator_id: 1,
      // revenue: 20,
      contribution: 30,
      incentives: [
        {
          index: 0,
          siret: '53996626700012',
          amount: 15,
        },
      ],
      payments: [
        {
          index: 0,
          siret: '53996626700012',
          amount: 10,
          type: 'sodexo',
        },
      ],
      isDriver: false,
    };

    const passengerResult = await action.handle(passengerData);

    console.log('passengerResult : ', passengerResult);

    expect(passengerResult.cost).to.be.eq(
      passengerData.contribution + passengerData.incentives[0].amount,
      'match with passenger revenue and incentives',
    );

    testPayments(passengerData, passengerResult, 'passenger');
  });
});
