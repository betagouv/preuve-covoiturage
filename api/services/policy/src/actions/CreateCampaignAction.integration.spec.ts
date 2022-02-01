import anyTest, { TestFn, ExecutionContext } from 'ava';
import { handlerMacro, HandlerMacroContext } from '@pdc/helper-test';

import { ServiceProvider } from '../ServiceProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/create.contract';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { ContextType } from '@ilos/common';

const start = new Date();
start.setMonth(start.getMonth() + 1);

const end = new Date();
end.setMonth(start.getMonth() + 2);

const territory = 1;
const fakeCampaign = {
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
} as unknown as ParamsInterface;

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

interface TestContext extends HandlerMacroContext {
  policy_id: number;
}

const { before, after, success, error } = handlerMacro<ParamsInterface, ResultInterface, Error, TestContext>(
  ServiceProvider,
  handlerConfig,
);

const test = anyTest as TestFn<TestContext>;

test.before(async (t) => {
  const { kernel } = await before();
  t.context.kernel = kernel;
});

test.after(async (t) => {
  await after(t.context);
});

test.after.always(async (t) => {
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

test('Wrong permission', error, fakeCampaign, 'Forbidden Error', mockContext(['wrong.permission']));
// test('Wrong territory', error, fakeCampaign, 'Forbidden Error', mockContext(['territory.policy.create'], 2));
test(
  'Wrong input',
  error,
  { ...fakeCampaign, status: 'other' },
  'Invalid params',
  mockContext(['territory.policy.create']),
);
test(
  success,
  JSON.parse(JSON.stringify(fakeCampaign)),
  (response: ResultInterface, t: ExecutionContext<TestContext>) => {
    t.context.policy_id = response._id;
    t.is(response.name, fakeCampaign.name);
  },
  mockContext(['territory.policy.create']),
);
