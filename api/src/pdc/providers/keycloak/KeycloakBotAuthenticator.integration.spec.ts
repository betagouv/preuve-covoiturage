import { afterAll, assert, beforeAll, describe, it } from "@/dev_deps.ts";
import { logger } from "@/lib/logger/index.ts";
import { IBotCredentials } from "@/pdc/providers/keycloak/IBotCredentials.ts";
import { KeycloakBotAuthenticator } from "./KeycloakBotAuthenticator.ts";
import { KeycloakManager } from "./KeycloakManager.ts";

describe("Keycloack Bot Auth", () => {
  let bot: IBotCredentials;

  const manager = new KeycloakManager();
  const provider = new KeycloakBotAuthenticator();

  beforeAll(async () => {
    bot = await manager.createBot(1);
  });

  afterAll(async () => {
    const result = await manager.listUser();
    for (
      const user of result.filter((u) => u.username === `bot:${bot.access_key}`)
    ) {
      await manager.deleteUser(user.id);
    }
  });

  it("Should login", async () => {
    const result = await provider.login(bot);
    logger.log(result);
    assert(false);
  });
});
