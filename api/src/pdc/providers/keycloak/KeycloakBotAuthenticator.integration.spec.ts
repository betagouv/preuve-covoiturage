import {
  afterAll,
  assert,
  assertEquals,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { IBotCredentials } from "@/pdc/providers/keycloak/IBotCredentials.ts";
import { KeycloakBotAuthenticator } from "./KeycloakBotAuthenticator.ts";
import { KeycloakManager } from "./KeycloakManager.ts";

describe("Keycloack Bot Auth", () => {
  let bot: IBotCredentials;
  let token: string;

  const manager = new KeycloakManager();
  const provider = new KeycloakBotAuthenticator();

  beforeAll(async () => {
    bot = await manager.createBot(1);
  });

  afterAll(async () => {
    const result = await manager.listUser();
    for (
      const user of result.filter((u) => u.username === `bot@${bot.access_key}`)
    ) {
      await manager.deleteUser(user.id);
    }
    // FIXME: UGLY cleanup
    const resources = Deno.resources();
    for (const rid in resources) {
      if (resources[rid] === "fetchResponse") {
        Deno.close(parseInt(rid));
      }
    }
  });

  it("Should login", async () => {
    const result = await provider.login(bot);
    assert(typeof result.token === "string");
    assert(result.expires_in === 300);
    token = result.token;
  });

  it("Should verify", async () => {
    const result = await provider.verify(token);
    assertEquals(result.operator_id, 1);
    assertEquals(result.role, "operator.user");
  });
});
