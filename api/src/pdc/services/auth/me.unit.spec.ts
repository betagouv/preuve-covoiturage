import { assertEquals } from "dep:assert";
import { describe, it } from "dep:testing-bdd";

import { meRoute } from "./me.ts";

// Stub du repository : ne connaît que les _id déclarés.
class StubUserRepository {
  public calls: number[] = [];
  constructor(private known: number[] = []) {}
  findById(id: number): Promise<{ _id: number } | null> {
    this.calls.push(id);
    return Promise.resolve(this.known.includes(id) ? { _id: id } : null);
  }
}

// Réponse express minimale : capture statut, corps et cookies effacés.
function mockRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    cleared: [] as string[],
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    clearCookie(name: string) {
      this.cleared.push(name);
      return this;
    },
  };
}

// Session express minimale : destroy() résout immédiatement et trace l'appel.
function mockSession(user: Record<string, unknown> | undefined) {
  return {
    user,
    destroyed: false,
    destroy(cb: (err?: Error) => void) {
      this.destroyed = true;
      cb();
    },
  };
}

// deno-lint-ignore no-explicit-any
async function invoke(repo: StubUserRepository, req: any) {
  const res = mockRes();
  let nextErr: unknown = undefined;
  await meRoute(repo as never, "pdc-session")(req, res, (err: unknown) => (nextErr = err));
  if (nextErr) throw nextErr;
  return res;
}

const unauthorized = { id: 1, jsonrpc: "2.0", error: { code: 401, data: "Error", message: "Unauthorized Error" } };

describe("GET /auth/me (meRoute)", () => {
  it("401 when no session user, without hitting the DB", async () => {
    const repo = new StubUserRepository([7]);
    const res = await invoke(repo, { session: mockSession(undefined) });
    assertEquals(res.statusCode, 401);
    assertEquals(res.body, unauthorized);
    assertEquals(repo.calls, []);
  });

  it("returns the session user as is when the account still exists", async () => {
    const repo = new StubUserRepository([7]);
    const user = { _id: 7, role: "territory.admin", territory_id: 200 };
    const session = mockSession(user);
    const res = await invoke(repo, { session });
    assertEquals(res.statusCode, 200);
    assertEquals(res.body, user);
    assertEquals(repo.calls, [7]);
    assertEquals(session.destroyed, false);
  });

  it("401, session destroyed and cookie cleared when the account was deleted", async () => {
    const repo = new StubUserRepository([]);
    const session = mockSession({ _id: 7, role: "territory.admin" });
    const res = await invoke(repo, { session });
    assertEquals(res.statusCode, 401);
    assertEquals(res.body, unauthorized);
    assertEquals(session.destroyed, true);
    assertEquals(res.cleared, ["pdc-session"]);
  });
});
