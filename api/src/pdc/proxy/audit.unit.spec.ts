import { assert, assertEquals, assertFalse, assertRejects, assertStringIncludes } from "dep:assert";
import { describe, it } from "dep:testing-bdd";
import { stub } from "dep:testing-mock";
import { ForbiddenException } from "@/ilos/common/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { audited, formatAuditLine, isAudited } from "./audit.ts";

const httpContext = {
  channel: { service: "proxy", transport: "http" },
  call: {
    user: {
      _id: 5,
      role: "territory.admin",
      territory_id: 12,
      email: "jean.dupont@example.com",
      firstname: "Jean",
      phone: "0601020304",
    },
  },
};

describe("isAudited", () => {
  it("trace les écritures", () => {
    assert(isAudited("dashboard:createUser"));
    assert(isAudited("dashboard:deleteTerritory"));
    assert(isAudited("territory:patchContacts"));
    assert(isAudited("campaign:finalize"));
    assert(isAudited("auth:createCredentials"));
    assert(isAudited("exports:claim"));
  });

  it("ignore les lectures", () => {
    assertFalse(isAudited("dashboard:users"));
    assertFalse(isAudited("territory:list"));
    assertFalse(isAudited("company:find"));
    assertFalse(isAudited("exports:getDownloadLink"));
    assertFalse(isAudited("unknown"));
  });

  it("ignore l'acquisition, déjà historisée", () => {
    assertFalse(isAudited("acquisition:create"));
    assertFalse(isAudited("acquisition:cancel"));
  });
});

describe("formatAuditLine", () => {
  it("garde l'acteur réduit et les identifiants de ressource", () => {
    const line = formatAuditLine("dashboard:updateUser", {
      context: httpContext,
      params: { _id: 42, email: "cible@example.com", lastname: "Martin", territory_id: 12 },
      ms: 12.6,
      outcome: { ok: true, result: { _id: 42 } },
    });
    assertEquals(
      line,
      "[audit] dashboard:updateUser outcome=ok ms=13 transport=http service=proxy " +
        "actor_id=5 actor_role=territory.admin actor_territory_id=12 _id=42 territory_id=12 result_id=42",
    );
  });

  it("n'écrit ni e-mail, ni nom, ni téléphone", () => {
    const line = formatAuditLine("dashboard:updateUser", {
      context: httpContext,
      params: { _id: 42, email: "cible@example.com", lastname: "Martin", phone: "0605060708" },
      ms: 1,
      outcome: { ok: true, result: { email: "cible@example.com" } },
    });
    for (const pii of ["@", "Martin", "Jean", "0605060708", "0601020304"]) {
      assertFalse(line.includes(pii), `${pii} dans ${line}`);
    }
  });

  it("ignore les identifiants non scalaires", () => {
    const line = formatAuditLine("territory:update", {
      context: httpContext,
      params: { _id: { $ne: 1 }, operator_id: [1, 2] },
      ms: 1,
      outcome: { ok: true, result: null },
    });
    assertFalse(line.includes(" _id="));
    assertFalse(line.includes(" operator_id="));
  });

  it("marque les appels sans transport comme internes", () => {
    const line = formatAuditLine("campaign:finalize", {
      context: { channel: { service: "campaign" } },
      params: {},
      ms: 1,
      outcome: { ok: true, result: undefined },
    });
    assertStringIncludes(line, "transport=internal service=campaign");
    assertFalse(line.includes("actor_"));
  });

  it("donne le type d'erreur et le code RPC, jamais le message", () => {
    const line = formatAuditLine("dashboard:deleteUser", {
      context: httpContext,
      params: { _id: 7 },
      ms: 1,
      outcome: { ok: false, error: new ForbiddenException("user jean.dupont@example.com") },
    });
    assertStringIncludes(line, "outcome=error error=ForbiddenException:-32503");
    assertFalse(line.includes("jean.dupont"));
  });
});

describe("audited", () => {
  it("trace une écriture réussie et renvoie son résultat", async () => {
    using info = stub(logger, "info");
    const result = await audited(
      "dashboard:deleteUser",
      { method: "x", params: { _id: 7 }, context: httpContext },
      () => Promise.resolve(true),
    );
    assertEquals(result, true);
    assertEquals(info.calls.length, 1);
    assertStringIncludes(info.calls[0].args[0] as string, "[audit] dashboard:deleteUser outcome=ok");
  });

  it("trace l'échec puis relance l'erreur", async () => {
    using warn = stub(logger, "warn");
    await assertRejects(() =>
      audited(
        "dashboard:deleteUser",
        { method: "x", params: {}, context: httpContext },
        () => Promise.reject(new ForbiddenException()),
      )
    );
    assertEquals(warn.calls.length, 1);
    assertStringIncludes(warn.calls[0].args[0] as string, "outcome=error");
  });

  it("ne trace pas les lectures", async () => {
    using info = stub(logger, "info");
    await audited("dashboard:users", { method: "x", params: {}, context: httpContext }, () => Promise.resolve([]));
    assertEquals(info.calls.length, 0);
  });

  it("ne trace pas une réclamation d'export vide", async () => {
    using info = stub(logger, "info");
    await audited("exports:claim", { method: "x", params: {}, context: httpContext }, () => Promise.resolve(null));
    assertEquals(info.calls.length, 0);
  });
});
