import anyTest, { TestInterface } from 'ava';
import { ValidateRuleParametersMiddleware } from './ValidateRuleParametersMiddleware';
import { AjvValidator } from '@pdc/provider-validator';
import { ConfigInterfaceResolver, InvalidParamsException, ContextType } from '@ilos/common';
import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import { RuleInterface } from '../engine/interfaces';

interface TestContext {
  middleware: ValidateRuleParametersMiddleware;
}

const test = anyTest as TestInterface<TestContext>;

class Config extends ConfigInterfaceResolver {
  get(k: string, fb: any): any {
    return fb;
  }
}

function setup(
  global_rules: RuleInterface[],
  rules: RuleInterface[][] = [],
): [CampaignInterface, ContextType, Function] {
  return [
    {
      global_rules,
      rules,
      territory_id: 1,
      name: 'test',
      description: 'test',
      start_date: new Date(),
      end_date: new Date(),
      unit: 'euro',
      status: 'draft',
    },
    {
      channel: {
        service: 'test',
      },
    },
    () => {},
  ];
}

test.before((t) => {
  const validator = new AjvValidator(new Config());
  validator.boot();
  t.context.middleware = new ValidateRuleParametersMiddleware(validator);
  t.context.middleware.init();
});

test.serial('should throw error if rule doest not exist', async (t) => {
  const slug = 'this_rule_doest_exists';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(...setup([{ slug }], [])),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(err.rpcError.data, `Unknown retribution rule: ${slug}`);
});

test.serial('should throw error if rule is not properly parametred (unnecessary params)', async (t) => {
  const slug = 'adult_only_filter';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(...setup([], [[{ slug, parameters: { toto: true } }]])),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(err.rpcError.data, 'No schema provided for this type');
});

test.serial('should throw error if rule is not properly parametred (missing params)', async (t) => {
  const slug = 'fixed_amount_setter';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(...setup([], [[{ slug }]])),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(
    err.rpcError.data,
    '[{"keyword":"type","dataPath":"","schemaPath":"#/type","params":{"type":"integer"},"message":"should be integer"}]',
  );
});

test.serial('should throw error if rule is not properly parametred (wrong params)', async (t) => {
  const slug = 'fixed_amount_setter';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(...setup([], [[{ slug, parameters: 'a' }]])),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(
    err.rpcError.data,
    '[{"keyword":"type","dataPath":"","schemaPath":"#/type","params":{"type":"integer"},"message":"should be integer"}]',
  );
});

test.serial('should throw error if missing uuid in stateful rule', async (t) => {
  const slug = 'max_amount_restriction';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(...setup([], [[{ slug, parameters: { amount: 10, period: 'day' } }]])),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(
    err.rpcError.data,
    '[{"keyword":"required","dataPath":"","schemaPath":"#/required","params":{"missingProperty":"uuid"},"message":"should have required property \'uuid\'"}]',
  );
});

test.serial('should throw error if uuid is not unique', async (t) => {
  const slug = 'max_amount_restriction';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(
      ...setup(
        [{ slug, parameters: { amount: 10, period: 'day', uuid: 'toto' } }],
        [[{ slug, parameters: { amount: 10, period: 'day', uuid: 'toto' } }]],
      ),
    ),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(
    err.rpcError.data,
    `${slug} should have an unique id`,
  );
});

test.serial('should throw error if global set contains unauthorized rules', async (t) => {
  const slug = 'fixed_amount_setter';
  const err = await t.throwsAsync<InvalidParamsException>(async () =>
    t.context.middleware.process(
      ...setup(
        [{ slug, parameters: 10 }],
        [],
      ),
    ),
  );
  t.log(err);
  t.is(err.message, 'Invalid params');
  t.is(
    err.rpcError.data,
    'Global rules accept only filter and statefule rules',
  );
});
