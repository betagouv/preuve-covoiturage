import { loginErrorMessage } from "@/helpers/loginError";
import { describe, expect, it } from "vitest";

describe("loginErrorMessage", () => {
  it("explique la double authentification requise, sans adresse de support", () => {
    const message = loginErrorMessage("mfa_required");
    expect(message?.severity).toBe("error");
    expect(message?.title).toBe("Double authentification requise");
    expect(message?.description).toContain("double authentification");
    expect(message?.support).toBeUndefined();
  });

  it("indique un compte non enregistré avec l'adresse du support", () => {
    const message = loginErrorMessage("unauthorized");
    expect(message?.severity).toBe("error");
    expect(message?.title).toBe("Compte non reconnu");
    expect(message?.description).toBe("Votre compte n'est pas enregistré sur la plateforme, contactez notre support : ");
    expect(message?.support).toBe("contact@covoiturage.beta.gouv.fr");
  });

  it("signale un échec de connexion avec l'adresse du support", () => {
    const message = loginErrorMessage("login_failed");
    expect(message?.severity).toBe("error");
    expect(message?.title).toBe("Connexion impossible");
    expect(message?.description).toBe(
      "La connexion a échoué, réessayez. Si le problème persiste, contactez notre support : ",
    );
    expect(message?.support).toBe("contact@covoiturage.beta.gouv.fr");
  });

  it("ne renvoie rien sans code ou pour un code inconnu", () => {
    expect(loginErrorMessage(null)).toBeNull();
    expect(loginErrorMessage("")).toBeNull();
    expect(loginErrorMessage("autre")).toBeNull();
  });
});
