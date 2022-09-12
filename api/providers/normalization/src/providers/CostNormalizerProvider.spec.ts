import test from 'ava';

import { CostNormalizerProvider } from './CostNormalizerProvider';
import { CostParamsInterface, CostResultInterface } from '../interfaces';
import { KernelInterfaceResolver } from '@ilos/common';

class MockedNormalizerCostAction extends CostNormalizerProvider {
  constructor() {
    super(null as unknown as KernelInterfaceResolver);
  }
  protected async getSiret(): Promise<string> {
    return '53996626700012';
  }
}

function testPayments(t, params: CostParamsInterface, result: CostResultInterface, userType: string): void {
  const length = params.payments?.length || 0
  t.is(
    result.payments.length,
    2 * length + 1,
    'Resulted payments should be a concatenation of data incentives, contributions and a final calculated payments',
  );

  const lastPayment = result.payments.pop();

  t.is(result.payments[0].type, 'incentive', 'First resulted payment should an actual payment');
  t.is(result.payments[1].type, 'payment', 'First resulted payment should an incentive');

  t.is(
    lastPayment?.amount,
    Math.abs(result.cost) - result.payments.reduce((sum, item) => sum + item.amount, 0),
    'Last payment should match resulted cost and payments (payment + incentives)',
  );
}

test('Cost normalization driver', async (t) => {
  const action = new MockedNormalizerCostAction();
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

  t.is(
    driverResult.cost,
    -driverData.revenue - driverData.incentives[0].amount,
    'cost match with driver revenue and incentives',
  );

  testPayments(t, driverData, driverResult, 'driver');
});

test('Passenger should', async (t) => {
  const action = new MockedNormalizerCostAction();

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

  console.debug(`passengerResult : ${passengerResult}`);

  t.is(
    passengerResult.cost,
    passengerData.contribution + passengerData.incentives[0].amount,
    'match with passenger revenue and incentives',
  );

  testPayments(t, passengerData, passengerResult, 'passenger');
});
