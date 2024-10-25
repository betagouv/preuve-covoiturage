import { assertEquals, describe, it, sinon } from "@/dev_deps.ts";
import { ContextType, KernelInterfaceResolver } from "@/ilos/common/index.ts";
import { ParamsInterfaceV2, ParamsInterfaceV3 } from "@/shared/export/create.contract.ts";
import { CreateActionV2 } from "./CreateActionV2.ts";

// ----------------------------------------------------------------------------------------
// SETUP
// ----------------------------------------------------------------------------------------

describe("CreateActionV2", () => {
  // stub the kernel to avoid calling CreateActionV3
  // but get the converted params
  const kernel = new (class extends KernelInterfaceResolver {})();
  sinon.stub(kernel, "call").callsFake(
    (_signature: string, params: unknown) =>
      new Promise((resolve) =>
        resolve({
          meta: { httpStatus: 201 },
          data: params,
        })
      ),
  );

  // ----------------------------------------------------------------------------------------
  // TESTS
  // ----------------------------------------------------------------------------------------

  // AJV requires dates to be strings and checks their format
  type AJVParamsInterfaceV3 = Omit<ParamsInterfaceV3, "start_at" | "end_at"> & {
    start_at: string;
    end_at: string;
  };

  /**
   * Setup all tests and their expected results.
   *
   * We want to make sure that the CreateActionV2 class
   * converts the params from V2 to V3 correctly
   */
  const configs: Array<
    { context: ContextType; v2: ParamsInterfaceV2; v3: AJVParamsInterfaceV3 }
  > = [
    // default call with minimum params
    {
      context: {
        channel: { service: "test" },
        call: { user: { _id: 1000 } },
      },
      v2: {
        tz: "Europe/Paris",
        date: { start: new Date("2021-01-01"), end: new Date("2021-01-31") },
      },
      v3: {
        tz: "Europe/Paris",
        start_at: "2021-01-01T00:00:00.000Z",
        end_at: "2021-01-31T00:00:00.000Z",
        operator_id: [],
        created_by: 1000,
      },
    },
    // pass an operator_id in the list
    {
      context: {
        channel: { service: "test" },
        call: { user: { _id: 1001 } },
      },
      v2: {
        tz: "Europe/Paris",
        date: { start: new Date("2021-01-01"), end: new Date("2021-01-31") },
        operator_id: [1],
      },
      v3: {
        tz: "Europe/Paris",
        start_at: "2021-01-01T00:00:00.000Z",
        end_at: "2021-01-31T00:00:00.000Z",
        operator_id: [1],
        created_by: 1001,
      },
    },

    // operator_id is taken from the context
    {
      context: {
        channel: { service: "test" },
        call: { user: { _id: 1002, operator_id: 1 } },
      },
      v2: {
        tz: "Europe/Paris",
        date: { start: new Date("2021-01-01"), end: new Date("2021-01-31") },
      },
      v3: {
        tz: "Europe/Paris",
        start_at: "2021-01-01T00:00:00.000Z",
        end_at: "2021-01-31T00:00:00.000Z",
        operator_id: [], // ERROR. should be [1] with active middlewares
        created_by: 1002,
      },
    },

    // territory_id is taken from the context
    // it sets the target to TERRITORY but does not set the geo_selector
    {
      context: {
        channel: { service: "test" },
        call: { user: { _id: 1003, territory_id: 1 } },
      },
      v2: {
        tz: "Europe/Paris",
        date: { start: new Date("2021-01-01"), end: new Date("2021-01-31") },
      },
      v3: {
        tz: "Europe/Paris",
        start_at: "2021-01-01T00:00:00.000Z",
        end_at: "2021-01-31T00:00:00.000Z",
        operator_id: [],
        created_by: 1003,
      },
    },
  ];

  // run the tests
  let counter = 0;
  for (const { v2, v3: expected, context } of configs) {
    counter++;
    it(`CreateActionV2 should convert params to V3 - #${counter}`, async () => {
      const action = new CreateActionV2(kernel);
      assertEquals(await action["handle"](v2, context), {
        meta: { httpStatus: 201 },
        data: expected,
      });
    });
  }
});
