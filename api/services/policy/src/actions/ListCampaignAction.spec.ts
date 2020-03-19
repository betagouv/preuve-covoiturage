import anyTest, { TestInterface, ExecutionContext } from 'ava';
import { handlerMacro, KernelTestInterface } from '@pdc/helper-test';

import { ServiceProvider } from '../ServiceProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/list.contract';
import { ParamsInterface as CampaignInterface } from '../shared/policy/create.contract';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { ContextType } from '@ilos/common';
import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces';

const start = new Date();
start.setMonth(start.getMonth() + 1);

const end = new Date();
end.setMonth(start.getMonth() + 2);

const territory = 1;
const fakeCampaign: CampaignInterface = {
  territory_id: territory,
  name: 'Ma campagne',
  description: 'Incite les covoitureurs',
  start_date: start,
  end_date: end,
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
};

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

const { test, success } = handlerMacro<ParamsInterface, ResultInterface, Error, TestContext>(
  myTest,
  ServiceProvider,
  handlerConfig,
);

test.before(async (t) => {
  const policy = await t.context.kernel
    .get(ServiceProvider)
    .get(CampaignRepositoryProviderInterfaceResolver)
    .create(fakeCampaign)

  t.context.policy_id = policy._id;
});

test(
  success,
  { territory_id: territory },
  (response: ResultInterface, t: ExecutionContext<TestContext>) => {
    t.true(Array.isArray(response));
    const policy = response.find(c => c._id === t.context.policy_id);
    t.is(policy.name, fakeCampaign.name);
  },
  mockContext(['incentive-campaign.list']),
);
