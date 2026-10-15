import { assertEquals, assertRejects } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { ContextType, ForbiddenException } from "@/ilos/common/index.ts";
import { DeleteUserAction } from "./DeleteUserAction.ts";

describe("DeleteUserAction", () => {
  const deleted: number[] = [];
  const repository = {
    deleteUser: async ({ id }: { id: number }) => {
      deleted.push(id);
      return { success: true, message: `user ${id} deleted`, outcome: "user_deleted" as const };
    },
  };
  const sessionRepository = { destroyByUser: async () => {} };
  // deno-lint-ignore no-explicit-any
  const action = new DeleteUserAction(repository as any, sessionRepository as any);

  const ctx = (id: number): ContextType => ({
    call: { user: { _id: id, role: "registry.admin", permissions: [] } },
    channel: { service: "proxy" },
  });

  it("403 sur son propre compte", async () => {
    await assertRejects(() => action.handle({ id: 9 }, ctx(9)), ForbiddenException);
    assertEquals(deleted, []);
  });

  it("supprime un autre compte", async () => {
    assertEquals((await action.handle({ id: 4 }, ctx(9))).outcome, "user_deleted");
    assertEquals(deleted, [4]);
  });
});
