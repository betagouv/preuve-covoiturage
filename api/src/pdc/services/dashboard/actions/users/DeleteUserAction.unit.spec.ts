import { assertEquals, assertRejects } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";
import { DeleteUserAction } from "./DeleteUserAction.ts";

describe("DeleteUserAction", () => {
  const deleted: number[] = [];
  const purged: number[] = [];
  const repository = {
    deleteUser: async ({ id }: { id: number }) => {
      deleted.push(id);
      return { success: true, message: `user ${id} deleted`, outcome: "user_deleted" as const };
    },
  };
  const sessionRepository = {
    destroyByUser: async (id: number) => {
      purged.push(id);
    },
  };
  // deno-lint-ignore no-explicit-any
  const action = new DeleteUserAction(repository as any, sessionRepository as any);

  const ctx = (id: number): ContextType => ({
    call: { user: { _id: id, role: "registry.admin", permissions: [] } },
    channel: { service: "proxy" },
  });

  it("403 sur son propre compte", async () => {
    await assertRejects(() => action.handle({ id: 9 }, ctx(9)), ForbiddenException);
    assertEquals(deleted, []);
    assertEquals(purged, []);
  });

  it("supprime un autre compte et purge ses sessions", async () => {
    assertEquals((await action.handle({ id: 4 }, ctx(9))).outcome, "user_deleted");
    assertEquals(deleted, [4]);
    assertEquals(purged, [4]);
  });

  it("répond quand même si la purge des sessions échoue", async () => {
    const failing = {
      destroyByUser: () => Promise.reject(new Error("redis down")),
    };
    // deno-lint-ignore no-explicit-any
    const degraded = new DeleteUserAction(repository as any, failing as any);
    assertEquals((await degraded.handle({ id: 5 }, ctx(9))).outcome, "user_deleted");
    assertEquals(deleted, [4, 5]);
  });
});
