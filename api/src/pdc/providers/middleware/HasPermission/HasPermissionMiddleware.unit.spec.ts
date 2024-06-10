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
  ContextType,
  ForbiddenException,
  InvalidParamsException,
  ParamsType,
  ResultType,
} from "@/ilos/common/index.ts";

import { HasPermissionMiddleware } from "./HasPermissionMiddleware.ts";

const middleware = new HasPermissionMiddleware();

const callFactory = (
  permissions: string[],
): {
  method: string;
  context: ContextType;
  params: ParamsType;
  result: ResultType;
} => ({
  method: "test",
  context: {
    channel: {
      service: "",
      transport: "node:http",
    },
    call: {
      user: {
        permissions,
      },
    },
  },
  params: {},
  result: null,
});

it("Permission middleware: matching 1 permission", async (t) => {
  const permissions = ["test.ok"];
  const { params, context } = callFactory(permissions);
  assertEquals(
    await middleware.process(params, context, () => {}, permissions),
    undefined,
  );
});

it("Permission middleware: no method permissions", async (t) => {
  const permissions = ["test.ok"];
  const { params, context } = callFactory(permissions);
  await assertThrows(
    middleware.process(params, context, () => {}, []),
    { instanceOf: InvalidParamsException },
  );
});

it("Permission middleware: no user permissions", async (t) => {
  const { params, context } = callFactory([]);
  await assertThrows(
    middleware.process(params, context, () => {}, ["not-ok"]),
    { instanceOf: ForbiddenException },
  );
});

it("Permission middleware: different permission", async (t) => {
  const permissions: string[] = ["test.ok"];
  const { params, context } = callFactory(permissions);
  await assertThrows(
    middleware.process(params, context, () => {}, ["not-ok"]),
    { instanceOf: ForbiddenException },
  );
});

it("Permission middleware: not matching all permissions", async (t) => {
  const permissions: string[] = ["perm1"];
  const { params, context } = callFactory(permissions);
  await assertThrows(
    middleware.process(params, context, () => {}, ["perm1", "perm2"]),
    {
      instanceOf: ForbiddenException,
    },
  );
});
