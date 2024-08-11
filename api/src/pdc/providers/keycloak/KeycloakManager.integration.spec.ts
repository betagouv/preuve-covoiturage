import { afterAll, assertEquals, describe, it } from "@/dev_deps.ts";
import { KeycloakManager } from "./KeycloakManager.ts";

describe("Keycloack Manager", () => {
  const user1 = {
    firstName: "Jean",
    lastName: "Dupond",
    email: "registry@admin.com",
    attributes: {
      phone: "+33601020304",
      pdc_role: "registry.admin",
    },
  };

  const user2 = {
    firstName: "Jeanne",
    lastName: "Dupuis",
    email: "territory@admin.com",
    attributes: {
      phone: "+33601020304",
      pdc_role: "territory.admin",
      territory_id: 12,
    },
  };

  const provider = new KeycloakManager();
  afterAll(async () => {
    const result = await provider.listUser();
    for (
      const user of result.filter((u) =>
        u.email == user1.email || u.email == user2.email
      )
    ) {
      await provider.deleteUser(user.id);
    }
  });

  it("Should list user", async (t) => {
    const result = await provider.listUser();
    assertEquals(result.length, 1);
  });

  it("Should create a user", async (t) => {
    await provider.createUser(user1);
    await provider.createUser(user2);
    const result = await provider.listUser();
    assertEquals(result.find((u) => u.email == user1.email), user1);
    assertEquals(result.find((u) => u.email == user2.email), user2);
  });
});
