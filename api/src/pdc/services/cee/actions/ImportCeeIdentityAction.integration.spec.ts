import { describe, it } from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import {
  assertErrorHandler,
  KernelContext,
} from "@/pdc/providers/test/index.ts";
import { handlerConfig } from "@/shared/cee/importApplicationIdentity.contract.ts";

describe("ImportCeeIdentityAction", () => {
  let kernel: KernelContext;

  const defaultContext: ContextType = {
    call: { user: { permissions: ["test.run"], operator_id: 1 } },
    channel: { service: "dummy" },
  };

  type Payload = {
    cee_application_type: string;
    identity_key: string;
    journey_type: string;
    last_name_trunc: string;
    phone_trunc: string;
    datetime: string;
  };

  const defaultPayload: Payload = {
    cee_application_type: "specific",
    identity_key: "0".repeat(64),
    journey_type: "short",
    last_name_trunc: "ABC",
    phone_trunc: "+336273488",
    datetime: "2023-01-02T00:00:00.000Z",
  };

  // ---------------------------------------------------------------------------
  // Tests
  // ---------------------------------------------------------------------------

  it("Invalid params empty", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [],
      [],
      defaultContext,
    );
  });

  it("Invalid params last_name_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, last_name_trunc: "abcd" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params unsupported journey type", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, journey_type: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params datetime", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, datetime: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Invalid params phone_trunc", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [{ ...defaultPayload, phone_trunc: "bip" }],
      [],
      defaultContext,
    );
  });

  it("Unauthorized", async () => {
    await assertErrorHandler(
      kernel,
      handlerConfig,
      [defaultPayload],
      [],
      { ...defaultContext, call: { user: {} } },
    );
  });
});
