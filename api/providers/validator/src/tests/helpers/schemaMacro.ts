import anyTest, { Macro, TestInterface, ExecutionContext } from 'ava';
import { ServiceProvider as BaseServiceProvider, Extensions } from '@ilos/core';
import { serviceProvider, ValidatorInterfaceResolver, NewableType } from '@ilos/common';

import { ValidatorExtension } from '../../ValidatorExtension';

@serviceProvider({
  validator: [],
})
class ServiceProvider extends BaseServiceProvider {
  extensions = [Extensions.Config, ValidatorExtension];
}

export class FakeObject {
  constructor(data: object) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}

interface TestContext {
  sp: ServiceProvider;
  provider: ValidatorInterfaceResolver;
}

type SuccessParam = {
  schema: object;
  obj?: NewableType<FakeObject>;
  data?: object;
};

type ErrorParam = {
  schema: object;
  obj?: NewableType<FakeObject>;
  data?: object;

  // https://github.com/avajs/ava/blob/master/docs/03-assertions.md#throwsasyncthrower-expectation-message
  // expectation can be an object with one or more of the following properties:

  //   instanceOf: a constructor, the thrown error must be an instance of
  //   is: the thrown error must be strictly equal to expectation.is
  //   message: either a string, which is compared against the thrown error's message,
  //            or a regular expression, which is matched against this message
  //   name: the expected .name value of the thrown error
  //   code: the expected .code value of the thrown error
  expectations?: null | Partial<{
    instanceOf: ErrorConstructor;
    is: any;
    message: string | RegExp;
    name: string;
    code: string | number;
  }>;
};

function registerSchemas(t: ExecutionContext<TestContext>, params: SuccessParam[] | ErrorParam[]): void {
  for (const param of params) {
    const { schema, obj } = param;
    t.context.provider.registerValidator(schema, obj);
  }
}

export function schemaMacro(): {
  test: TestInterface<TestContext>;
  success: Macro<[SuccessParam[]], TestContext>;
  error: Macro<[ErrorParam[]], TestContext>;
} {
  const test = anyTest as TestInterface<TestContext>;

  test.beforeEach(async (t) => {
    t.context.sp = new ServiceProvider();
    await t.context.sp.register();
    await t.context.sp.init();
    t.context.provider = t.context.sp.getContainer().get(ValidatorInterfaceResolver);
  });

  const success: Macro<[SuccessParam[]], TestContext> = async (
    t: ExecutionContext<TestContext>,
    params: SuccessParam[],
  ): Promise<void> => {
    registerSchemas(t, params);

    // test only schema provided with a FakeObject
    for (const param of params) {
      const { obj, data } = param;
      if (!obj) continue;
      t.true(await t.context.provider.validate(new obj(data)));
    }
  };

  const error: Macro<[ErrorParam[]], TestContext> = async (t: ExecutionContext<TestContext>, params: ErrorParam[]) => {
    registerSchemas(t, params);

    // test only schema provided with a FakeObject
    for (const param of params) {
      const { obj, data, expectations = null } = param;
      if (!obj) continue;
      await t.throwsAsync(() => t.context.provider.validate(new obj(data)), expectations);
    }
  };

  return {
    test,
    success,
    error,
  };
}
