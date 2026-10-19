import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { NextFunction, Request as ExpressRequest, Response } from "dep:express";
import { requireUser } from "./authGuard.ts";

function mockRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

function run(req: unknown) {
  const res = mockRes();
  let called = false;
  const next: NextFunction = () => {
    called = true;
  };
  requireUser()(req as ExpressRequest, res as unknown as Response, next);
  return { res, nextCalled: called };
}

describe("requireUser", () => {
  it("401 JSON-RPC when neither a session user nor a stateless user is present", () => {
    const { res, nextCalled } = run({ headers: {}, session: {} });
    assertEquals(nextCalled, false);
    assertEquals(res.statusCode, 401);
    assertEquals(res.body, {
      id: 1,
      jsonrpc: "2.0",
      error: { code: 401, data: "Error", message: "Unauthorized Error" },
    });
  });

  it("401 when the request carries no session at all", () => {
    const { res, nextCalled } = run({ headers: {} });
    assertEquals(nextCalled, false);
    assertEquals(res.statusCode, 401);
  });

  it("continues with a session user", () => {
    const { res, nextCalled } = run({ headers: {}, session: { user: { _id: 7 } } });
    assertEquals(nextCalled, true);
    assertEquals(res.statusCode, 200);
  });

  it("continues with a stateless (access token) user", () => {
    const { res, nextCalled } = run({ headers: {}, stateless: { user: { operator_id: 1 } } });
    assertEquals(nextCalled, true);
    assertEquals(res.statusCode, 200);
  });
});
