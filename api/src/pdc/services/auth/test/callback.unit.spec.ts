import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ConfigInterfaceResolver } from "@/ilos/common/index.ts";
import { Request, Response } from "dep:express";
import { testCallbackRoute } from "./callback.ts";

function makeConfig(map: Map<string, string>): ConfigInterfaceResolver {
  return { get: (k: string) => (k === "test.accounts" ? () => map : undefined) } as unknown as ConfigInterfaceResolver;
}

type Captured = { status?: number; body?: unknown; regenerated: boolean; session: Record<string, unknown> };

function makeReqRes(body: Record<string, unknown>): { req: Request; res: Response; out: Captured } {
  const out: Captured = { regenerated: false, session: {} };
  const session = {
    regenerate(cb: (err?: Error) => void) {
      out.regenerated = true;
      cb();
    },
  } as Record<string, unknown>;
  out.session = session;
  const req = { body, session } as unknown as Request;
  const res = {
    status(s: number) {
      out.status = s;
      return this;
    },
    json(b: unknown) {
      out.body = b;
      return this;
    },
  } as unknown as Response;
  return { req, res, out };
}

describe("testCallbackRoute", () => {
  const accounts = new Map([["admin@x.test", "pw"], ["operator@x.test", "pw"]]);

  it("400 without credentials", async () => {
    const { req, res, out } = makeReqRes({});
    await testCallbackRoute(makeConfig(accounts))(req, res, () => {});
    assertEquals(out.status, 400);
  });

  it("401 on wrong password, no session written", async () => {
    const { req, res, out } = makeReqRes({ email: "admin@x.test", password: "nope" });
    await testCallbackRoute(makeConfig(accounts))(req, res, () => {});
    assertEquals(out.status, 401);
    assertEquals(out.regenerated, false);
    assertEquals(out.session.user, undefined);
  });

  it("401 on unknown email", async () => {
    const { req, res, out } = makeReqRes({ email: "ghost@x.test", password: "pw" });
    await testCallbackRoute(makeConfig(accounts))(req, res, () => {});
    assertEquals(out.status, 401);
  });

  it("regenerates session and writes user on success", async () => {
    const { req, res, out } = makeReqRes({ email: "operator@x.test", password: "pw" });
    await testCallbackRoute(makeConfig(accounts))(req, res, () => {});
    assertEquals(out.status, undefined); // res.json without explicit status = 200
    assertEquals(out.regenerated, true);
    const user = out.session.user as { role: string; operator_id: number };
    assertEquals(user.role, "operator.admin");
    assertEquals(user.operator_id, 1);
  });
});
