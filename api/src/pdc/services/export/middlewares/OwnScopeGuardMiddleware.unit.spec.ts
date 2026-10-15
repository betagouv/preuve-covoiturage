import { assertEquals, assertRejects } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";
import { OwnScopeGuardMiddleware } from "./OwnScopeGuardMiddleware.ts";

describe("OwnScopeGuardMiddleware", () => {
  const middleware = new OwnScopeGuardMiddleware();
  const next = async () => "next() called";

  const ctx = (user: Record<string, unknown>): ContextType => ({
    call: { user },
    channel: { service: "proxy" },
  });

  const operatorUser = { role: "operator.admin", operator_id: 1 };
  const territoryUser = { role: "territory.admin", territory_id: 1 };
  const registryAdmin = { role: "registry.admin" };

  it("403 sur l'opérateur d'un tiers", async () => {
    await assertRejects(
      () => middleware.process({ operator_id: [2] }, ctx(operatorUser), next, undefined),
      ForbiddenException,
    );
  });

  it("403 sur le territoire d'un tiers", async () => {
    await assertRejects(
      () => middleware.process({ territory_id: 2 }, ctx(territoryUser), next, undefined),
      ForbiddenException,
    );
  });

  it("OK sur son propre périmètre", async () => {
    assertEquals(await middleware.process({ operator_id: [1] }, ctx(operatorUser), next, undefined), "next() called");
    assertEquals(await middleware.process({ territory_id: 1 }, ctx(territoryUser), next, undefined), "next() called");
  });

  it("OK quand l'appelant ne précise pas de périmètre", async () => {
    assertEquals(await middleware.process({}, ctx(operatorUser), next, undefined), "next() called");
  });

  it("OK pour une session sans périmètre : elle a accès à tout", async () => {
    assertEquals(
      await middleware.process({ operator_id: [2], territory_id: [3] }, ctx(registryAdmin), next, undefined),
      "next() called",
    );
  });
});
