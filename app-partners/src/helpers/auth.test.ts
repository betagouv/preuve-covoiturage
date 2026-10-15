import { getRolesList, isEditableRole, switchableScopes } from "@/helpers/auth";
import { describe, expect, it } from "vitest";

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
