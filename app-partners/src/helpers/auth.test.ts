import { getRolesList, getUserSession, isEditableRole, proconnectAccountUrl, switchableScopes } from "@/helpers/auth";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("getUserSession", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renvoie l'utilisateur quand /auth/me répond 200", async () => {
    const user = { _id: 7, role: "territory.admin" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(user), { status: 200 })));

    expect(await getUserSession()).toEqual(user);
  });

  it("renvoie undefined quand /auth/me répond 401", async () => {
    const body = { error: { code: 401, message: "Unauthorized Error" } };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 401 })));

    expect(await getUserSession()).toBeUndefined();
  });
});

describe("isEditableRole", () => {
  it("n'accepte que les rôles attribuables depuis l'interface", () => {
    expect(isEditableRole("territory.admin")).toBe(true);
    expect(isEditableRole("operator.user")).toBe(true);
    expect(isEditableRole("registry.user")).toBe(false);
    expect(isEditableRole("territory.demo")).toBe(false);
    expect(isEditableRole("anonymous")).toBe(false);
  });
});

describe("getRolesList", () => {
  it("limite un admin à sa famille de rôles", () => {
    expect(getRolesList("territory.admin").every((r) => r.startsWith("territory."))).toBe(true);
    expect(getRolesList("operator.admin").every((r) => r.startsWith("operator."))).toBe(true);
  });

  it("ne propose que des rôles attribuables", () => {
    expect(getRolesList("registry.admin").every(isEditableRole)).toBe(true);
  });
});

describe("switchableScopes", () => {
  const scopes = [
    { territory_id: 1, label: "IDFM" },
    { territory_id: 2, label: "Lyon" },
  ];

  it("liste les territoires quand il y en a au moins deux", () => {
    expect(switchableScopes({ scopes }, true)).toEqual(scopes);
  });

  it("ne propose rien avec un seul territoire", () => {
    expect(switchableScopes({ scopes: [scopes[0]] }, true)).toEqual([]);
  });

  it("ignore les périmètres opérateur", () => {
    expect(switchableScopes({ scopes: [...scopes, { operator_id: 3, label: "Op" }] }, true)).toEqual(scopes);
  });

  it("ne propose rien flag coupé ou sans utilisateur", () => {
    expect(switchableScopes({ scopes }, false)).toEqual([]);
    expect(switchableScopes(undefined, true)).toEqual([]);
  });
});

describe("proconnectAccountUrl", () => {
  it("utilise l'URI configurée", () => {
    expect(proconnectAccountUrl("https://identite-sandbox.proconnect.gouv.fr/personal-information")).toBe(
      "https://identite-sandbox.proconnect.gouv.fr/personal-information",
    );
  });

  it("replie sur la production quand la variable est vide", () => {
    expect(proconnectAccountUrl("")).toBe("https://identite.proconnect.gouv.fr/personal-information");
    expect(proconnectAccountUrl(undefined)).toBe("https://identite.proconnect.gouv.fr/personal-information");
  });
});
