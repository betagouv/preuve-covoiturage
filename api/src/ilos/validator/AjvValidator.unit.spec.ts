import { ConfigInterfaceResolver, RPCException } from "@/ilos/common/index.ts";
import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";

import { AjvValidator } from "./AjvValidator.ts";

interface Context {
  sandbox: sinon.SinonSandbox;
  provider: AjvValidator;
}

const test = anyTest as TestFn<Context>;

beforeEach((t) => {
  const fakeConfig = sinon.createStubInstance(ConfigInterfaceResolver, {
    get() {
      return {};
    },
  });

  t.context.provider = new AjvValidator(fakeConfig);
  t.context.provider.boot();
});

afterEach((t) => {
  sinon.restore();
});

class FakeObject {
  constructor(data) {
    Reflect.ownKeys(data).forEach((key) => {
      this[key] = data[key];
    });
  }
}

it("should work", async (t) => {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema",
    type: "object",
    properties: {
      hello: {
        type: "string",
      },
    },
    required: ["hello"],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  const result = await t.context.provider.validate(
    new FakeObject({ hello: "world" }),
  );
  assert(result);
});

it("should raise exception on invalid data", async (t) => {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema",
    type: "object",
    properties: {
      hello: {
        type: "string",
      },
    },
    required: ["hello"],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  const err: RPCException = await assertThrows(async () =>
    t.context.provider.validate(new FakeObject({ hello: 1 }))
  );
  assertEquals(err.message, "Invalid params");
  assertEquals(err.rpcError.data[0], "/hello: must be string");
});

it("should work with ref", async (t) => {
  const subSchema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema.world",
    type: "object",
    properties: {
      world: {
        type: "string",
      },
    },
    required: ["world"],
  };
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema",
    type: "object",
    properties: {
      hello: {
        $ref: "myschema.world",
      },
    },
    required: ["hello"],
  };
  t.context.provider.registerValidator(subSchema);
  t.context.provider.registerValidator(schema, FakeObject);
  const result = await t.context.provider.validate(
    new FakeObject({ hello: { world: "!!!" } }),
  );
  assert(result);
});

it("should work with inheritance", async (t) => {
  class FakeObjectExtended extends FakeObject {}

  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema",
    type: "object",
    properties: {
      hello: {
        type: "boolean",
      },
    },
    required: ["hello"],
  };

  const schemaExtended = {
    $schema: "http://json-schema.org/draft-07/schema#",
    $id: "myschema.extended",
    type: "object",
    properties: {
      hello: {
        type: "string",
      },
    },
    required: ["hello"],
  };

  t.context.provider.registerValidator(schema, FakeObject);
  t.context.provider.registerValidator(schemaExtended, FakeObjectExtended);

  const resultExtended = await t.context.provider.validate(
    new FakeObjectExtended({ hello: "world" }),
  );
  assert(resultExtended);
  const result = await t.context.provider.validate(
    new FakeObject({ hello: true }),
  );
  assert(result);
});
