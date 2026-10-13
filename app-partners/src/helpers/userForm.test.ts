import { userFormSchema } from "@/helpers/userForm";
import { describe, expect, it } from "vitest";

const valid = {
  firstname: "Camille",
  lastname: "Martin",
  email: "camille@example.org",
  role: "territory.user",
  operator_id: null,
  territory_id: 12,
  login_siren: null,
  scopes: [{ territory_id: 12, is_default: true }],
};

const fieldErrors = (row: Record<string, unknown>) => {
  const r = userFormSchema.safeParse(row);
  return r.success ? {} : r.error.flatten().fieldErrors;
};

describe("userFormSchema", () => {
  it("accepte un compte territoire complet", () => {
    expect(userFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rogne les noms et normalise l'email", () => {
    const r = userFormSchema.parse({ ...valid, firstname: "  Camille ", email: " Camille@Example.ORG " });
    expect(r.firstname).toBe("Camille");
    expect(r.email).toBe("camille@example.org");
  });

  it("refuse les blancs, les chevrons et plus de 256 caractères", () => {
    expect(fieldErrors({ ...valid, firstname: "     " }).firstname).toBeDefined();
    expect(fieldErrors({ ...valid, lastname: "<script>" }).lastname).toEqual([
      "Les caractères < et > ne sont pas autorisés",
    ]);
    expect(fieldErrors({ ...valid, lastname: "a".repeat(257) }).lastname).toBeDefined();
  });

  it("accepte un SIREN de 9 chiffres ou null, jamais une chaîne vide", () => {
    expect(fieldErrors({ ...valid, login_siren: "123456789" }).login_siren).toBeUndefined();
    expect(fieldErrors({ ...valid, login_siren: null }).login_siren).toBeUndefined();
    expect(fieldErrors({ ...valid, login_siren: "" }).login_siren).toBeDefined();
    expect(fieldErrors({ ...valid, login_siren: "12345678" }).login_siren).toBeDefined();
  });

  it("exige un opérateur pour un rôle opérateur", () => {
    expect(fieldErrors({ ...valid, role: "operator.user", operator_id: null }).operator_id).toEqual([
      "Sélectionnez un opérateur",
    ]);
    expect(fieldErrors({ ...valid, role: "operator.user", operator_id: 3 }).operator_id).toBeUndefined();
  });

  it("exige un périmètre pour un rôle territoire quand les périmètres sont édités", () => {
    expect(fieldErrors({ ...valid, scopes: [] }).scopes).toEqual(["Ajoutez au moins un périmètre"]);
    // territory.admin n'édite pas les périmètres : scopes absent du corps.
    expect(fieldErrors({ ...valid, scopes: undefined }).scopes).toBeUndefined();
  });

  it("refuse un rôle inconnu", () => {
    expect(fieldErrors({ ...valid, role: "superuser" }).role).toBeDefined();
  });
});
