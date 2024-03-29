import { ContextType } from '@ilos/common';
import anyTest, { ExecutionContext, TestFn } from 'ava';
import { CastToArrayMiddleware, HelperArgs } from './CastToArrayMiddleware';

// typescript brainf???

type TestContext = {
  caster: CastToArrayMiddleware;
  nextMock: <TParams = Record<string, any>>(params: TParams, context: ContextType) => TParams;
  requestContext: ContextType;
};

// FIXME - fails on props not listed in the helper args
type Input = [Record<string, any>, HelperArgs];
type Expected<TInput extends Input> = {
  [K in keyof TInput[0]]: K extends TInput[1][number] ? Array<TInput[0][K]> : TInput[0][K];
};

// setup a macro for concise test definitions

const test = anyTest as TestFn<TestContext>;

async function macro(t: ExecutionContext<TestContext>, input: Input, expected: Expected<Input>): Promise<void> {
  const [params, helperArgs] = input;
  const result = await t.context.caster.process(params, t.context.requestContext, t.context.nextMock, helperArgs);
  t.deepEqual(result, expected);
}

test.before((t) => {
  t.context.caster = new CastToArrayMiddleware();
  t.context.nextMock = <TParams>(params: TParams, context: ContextType): TParams => params;
  t.context.requestContext = { channel: { service: 'test' } };
});

// test cases
/* eslint-disable max-len, prettier/prettier */

test(`should cast int to array`, macro, [{ prop: 1 }, ['prop']], { prop: [1] });
test(`should cast str to array`, macro, [{ prop: 'abc' }, ['prop']], { prop: ['abc'] });
test(`should cast null to array`, macro, [{ prop: null }, ['prop']], { prop: [null] });
test(`should not wrap existing array`, macro, [{ prop: [1] }, ['prop']], { prop: [1] });
test(`should skip undefined prop value`, macro, [{ prop: undefined }, ['prop']], { prop: undefined });

test(`should cast multiple props A`, macro, [{ prop: 1, prop2: 'abc' }, ['prop', 'prop2']], { prop: [1], prop2: ['abc'] });

// @ts-ignore - prop3 fails in Expected type
test(`should cast multiple props B`, macro, [{ prop: 1, prop2: 'abc', prop3: 'def' }, ['prop', 'prop2']], { prop: [1], prop2: ['abc'], prop3: 'def' });
// @ts-ignore
test(`should cast multiple props C`, macro, [{ prop: null, prop2: undefined, prop3: 'def' }, ['prop', 'prop2']], { prop: [null], prop2: undefined, prop3: 'def' });
