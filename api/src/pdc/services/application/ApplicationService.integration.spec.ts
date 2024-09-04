import {
  afterAll,
  assert,
  assertEquals,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import {
  HttpContext,
  makeHttpBeforeAfter,
} from "@/pdc/providers/test/index.ts";
import { ServiceProvider } from "./ServiceProvider.ts";

describe.skip("application service", () => {
  let ctx: HttpContext;
  let application_test_context: any;
  const operator_id: number = Math.round(Math.random() * 1000);
  const { before, after } = makeHttpBeforeAfter(ServiceProvider);
  beforeAll(async () => {
    ctx = await before();
  });

  afterAll(async () => {
    await after(ctx);
  });
  it("#1 - Creates an application", async () => {
    const response = await ctx.request(
      "application:create",
      {
        name: "Application",
      },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.create"],
          },
        },
      },
    );
    assert("result" in response);
    assert("uuid" in response.result);
    assertEquals(response.result.name, "Application");
    assertEquals(response.result.owner_id, operator_id);
    assertEquals(response.result.owner_service, "operator");
    application_test_context = response.result;
  });

  it("#2.0 - Find the application by id", async () => {
    const response = await ctx.request(
      "application:find",
      {
        uuid: application_test_context.uuid,
        owner_id: application_test_context.owner_id,
        owner_service: application_test_context.owner_service,
      },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.find"],
          },
        },
      },
    );
    assertEquals(response.result.uuid, application_test_context.uuid);
    assertEquals(response.result.name, "Application");
    assertEquals(response.result.owner_id, operator_id);
    assertEquals(response.result.owner_service, "operator");
  });

  it("#2.1 - Fails if no owner set", async () => {
    const response = await ctx.request(
      "application:find",
      {
        uuid: application_test_context.uuid,
        owner_service: application_test_context.owner_service,
      },
      {
        call: {
          user: {
            permissions: ["operator.application.find"],
          },
        },
      },
    );

    assert("error" in response);
    assertEquals(response.error.code, -32503);
    assertEquals(response.error.message, "Forbidden Error");
    assertEquals(response.error.data, "Invalid permissions");
  });

  it("#3.1 - Revoke the application OK", async () => {
    const result = await ctx.request(
      "application:revoke",
      {
        uuid: application_test_context.uuid,
      },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.revoke"],
          },
        },
      },
    );
    assertEquals(result.result, undefined);
  });

  it("#3.2 - Cannot revoke twice the same app", async () => {
    const result = await ctx.request(
      "application:revoke",
      { uuid: application_test_context.uuid },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.revoke"],
          },
        },
      },
    );
    assert("error" in result);
  });

  it("#4 - List applications", async () => {
    await ctx.request(
      "application:create",
      {
        name: "Application A",
      },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.create"],
          },
        },
      },
    );
    await ctx.request(
      "application:create",
      {
        name: "Application B",
      },
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.create"],
          },
        },
      },
    );
    const result = await ctx.request(
      "application:list",
      {},
      {
        call: {
          user: {
            operator_id: operator_id,
            permissions: ["operator.application.list"],
          },
        },
      },
    );
    assert(Array.isArray(result.result));
    assertEquals(result.result.length, 2);
    const sortedResults = result.result.sort((
      a,
      b,
    ) => (a._id > b._id ? 1 : -1));
    assertEquals(sortedResults[0].name, "Application A");
    assertEquals(sortedResults[1].name, "Application B");
  });
});
