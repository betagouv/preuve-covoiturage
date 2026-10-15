import { getRolesList, isEditableRole } from "@/helpers/auth";
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
