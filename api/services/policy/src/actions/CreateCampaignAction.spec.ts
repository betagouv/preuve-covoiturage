import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { handlerMacro, KernelTestInterface } from '@pdc/helper-test';

import { ServiceProvider } from '../ServiceProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/create.contract';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { ContextType } from '@ilos/common';

const start = new Date();
start.setMonth(start.getMonth() + 1);

const end = new Date();
end.setMonth(start.getMonth() + 2);

const territory = 1;
const fakeCampaign = ({
  territory_id: territory,
  name: 'Ma campagne',
  description: 'Incite les covoitureurs',
  start_date: start.toISOString(),
  end_date: end.toISOString(),
  unit: 'euro',
  status: 'draft',
  global_rules: [],
  rules: [
    [
      {
        slug: 'adult_only_filter',
      },
    ],
  ],
} as unknown) as ParamsInterface;

function mockContext(permissions: string[], territory_id = territory): ContextType {
  return {
    channel: {
      service: 'proxy',
      transport: 'http',
    },
    call: {
      user: {
        permissions,
        territory_id,
      },
    },
  };
}

interface TestContext extends KernelTestInterface {
  policy_id: number;
}

const myTest = anyTest as TestInterface<TestContext>;

myTest.after.always(async (t) => {
  if (t.context.policy_id) {
    t.context.kernel
      .get(ServiceProvider)
      .get(PostgresConnection)
      .getClient()
      .query({
        text: `DELETE FROM policy.policies WHERE _id = $1`,
        values: [t.context.policy_id],
      });
  }
});

const { test, success, error } = handlerMacro<ParamsInterface, ResultInterface, Error, TestContext>(
  myTest,
  ServiceProvider,
  handlerConfig,
);

test('Wrong permission', error, fakeCampaign, 'Forbidden Error', mockContext(['wrong.permission']));
test('Wrong territory', error, fakeCampaign, 'Forbidden Error', mockContext(['incentive-campaign.create'], 2));
test(
  'Wrong input',
  error,
  { ...fakeCampaign, status: 'other' },
  'Invalid params',
  mockContext(['incentive-campaign.create']),
);
test(
  success,
  fakeCampaign,
  (response: ResultInterface, t: ExecutionContext<TestContext>) => {
    t.context.policy_id = response._id;
    t.is(response.name, fakeCampaign.name);
  },
  mockContext(['incentive-campaign.create']),
);
